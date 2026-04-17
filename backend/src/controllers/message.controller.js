import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Channel } from "../models/channel.model.js";
import { Message } from "../models/message.models.js";
import { apiResponse } from "../utils/apiResponse.js";

const roleHierarchy = {
    Observer: 1,
    Agent: 2,
    Operations: 3,
    Admin: 4
};

// Send Message
const sendMessage = asyncHandler(async (req, res) => {
    const { channelId, content, minVisibilityRole } = req.body;
    if (!content || content.trim() === "") throw new apiError(400, "Message Content Required");

    const channel = await Channel.findById(channelId).populate('participants.user', '_id');
    if (!channel) throw new apiError(404, "Channel not Found");

    const participant = channel.participants.find(
        p => (p.user?._id || p.user).toString() === req.user._id.toString()
    );
    if (!participant) throw new apiError(403, "You are not a member of this Channel");

    const message = await Message.create({
        channel: channelId,
        sender: req.user._id,
        content,
        minVisibilityRole: minVisibilityRole || "Observer"
    });

    await message.populate("sender", "username fullName avatar");

    channel.lastMessage = message._id;
    await channel.save();

    const io = req.app.get("io");
    if (io) {
        const minLevel = roleHierarchy[message.minVisibilityRole] || 1;
        const socketsInRoom = await io.in(channelId.toString()).fetchSockets();

        for (const sock of socketsInRoom) {
            const sockUserId = sock.user?._id?.toString();
            if (!sockUserId) continue;

            if (sockUserId === req.user._id.toString()) continue;

            const sockParticipant = channel.participants.find(
                p => (p.user?._id || p.user).toString() === sockUserId
            );
            const userRole = sockParticipant?.channelRole || 'Observer';
            const userLevel = roleHierarchy[userRole] || 1;

            if (userLevel >= minLevel) {
                sock.emit("receive_message", message); // ← individual, not broadcast
            }
        }
    }

    return res.status(201).json(
        new apiResponse(201, message, "Message sent Successfully")
    );
});

// Get Channel Messages
const getChannelMessages = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) throw new apiError(404, "Channel not Found");

    const participant = channel.participants.find(
        p => p.user.toString() === req.user._id.toString()
    );
    if (!participant) throw new apiError(403, "Access denied");

    const userRole = participant.channelRole;

    const messages = await Message.find({
        channel: channelId,
        isDeleted: false
    })
        .populate("sender", "username fullName avatar")
        .sort({ createdAt: 1 });

    const visibleMessages = messages.filter(msg =>
        roleHierarchy[userRole] >= roleHierarchy[msg.minVisibilityRole]
    );

    return res.status(200).json(
        new apiResponse(200, visibleMessages, "Messages fetched")
    );
});

// Edit Message
const editMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;
    if (!content || content.trim() === "") throw new apiError(400, "Message content Required");

    const message = await Message.findById(messageId);
    if (!message) throw new apiError(404, "Message not Found");
    if (message.sender.toString() !== req.user._id.toString())
        throw new apiError(403, "You can only edit your own message");

    message.content = content;
    message.isEdited = true;
    await message.save();

    await message.populate("sender", "username fullName avatar");

    const io = req.app.get("io");
    if (io) {
        io.to(message.channel.toString()).emit("message:updated", message);
    }

    return res.status(200).json(
        new apiResponse(200, message, "Message updated Successfully")
    );
});

// Delete Message
const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) throw new apiError(404, "Message not Found");
    if (message.sender.toString() !== req.user._id.toString())
        throw new apiError(403, "You can only delete your own message");

    message.isDeleted = true;
    message.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await message.save();

    const io = req.app.get("io");
    if (io) {
        io.to(message.channel.toString()).emit("message:deleted", { _id: message._id });
    }

    return res.status(200).json(
        new apiResponse(200, {}, "Message deleted. It will be permanently removed in 24 hours.")
    );
});

// Update Message TTL
const updateMessageTTL = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { ttlMinutes } = req.body;

    const message = await Message.findById(messageId);
    if (!message) throw new apiError(404, "Message not Found");
    if (message.sender.toString() !== req.user._id.toString())
        throw new apiError(403, "Not Authorized");

    if (ttlMinutes === null || ttlMinutes === 0) {
        message.expiresAt = undefined;
    } else {
        message.expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    }
    await message.save();

    await message.populate("sender", "username fullName avatar");

    const io = req.app.get("io");
    if (io) {
        io.to(message.channel.toString()).emit("message:updated", message);
    }

    return res.status(200).json(
        new apiResponse(200, message, "TTL updated Successfully")
    );
});

export {
    sendMessage,
    getChannelMessages,
    editMessage,
    deleteMessage,
    updateMessageTTL
};