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

const sendMessage = asyncHandler(async (req, res) => {
    const {channelId, content, minVisibilityRole} = req.body;
    if(!content || content.trim() === "") throw new apiError(400, "Message Content Required");

    const channel = await Channel.findById(channelId);
    if(!channel) throw new apiError(404, "Channel not Found");

    const participants = channel.participants.find(
        p => p.user.toString() === req.user._id.toString()
    );
    if(!participants) throw new apiError(403, "You are not a member of this Channel");

    const message = await Message.create({
        channel: channelId,
        sender: req.user._id,
        content,
        minVisibilityRole : minVisibilityRole || "Observer"
    });

    channel.lastMessage = message._id;
    await channel.save();

    return res.status(201).json(
        new apiResponse(201, message, "Message sent Successfully")
    );
});

// Get Channal messages
const getChannelMessages = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    const channel = await Channel.findById(channelId);
    if(!channel) throw new apiError(404, "Channel not Found");

    const participant = channel.participants.find((p) => {
        return p.user.toString() === req.user._id.toString();
    });
    if(!participant) throw new apiError(403, "Access denied");

    const userRole = participant.channelRole;

    const message = await Message.find({
        channel: channelId,
        isDeleted: false
    }).populate("sender", "username fullName avatar").sort({createdAt: 1});

    const visibleMessage = message.filter(message =>{
        return(
            roleHierarchy[userRole] >= roleHierarchy[message.minVisibilityRole]
        );
    });

    return res.status(200).json(
        new apiResponse(200, visibleMessage, "Message fetched")
    );
});

//Edit Message
const editMessage = asyncHandler(async(req, res) => {
    const {messageId} = req.params;
    const {content} = req.body;
    if(!content || content.trim() === "") throw new apiError(400, "Message content Required");
    
    const message = await Message.findById(messageId);
    if(!message) throw new apiError(404, "Message content Required");
    if(message.sender.toString() !== req.user._id.toString()) throw new apiError(403, "You can Only edit your own message");

    message.content = content;
    message.isEdited = true;

    await message.save();
    return res.status(200).json(
        new apiResponse(200, message, "Message updated Successfully")
    );
});

//Delete Message
const deleteMessage = asyncHandler(async (req, res) => {
    const {messageId} = req.params;
    const message = await Message.findById(messageId);
    if(!message) throw new apiError(404, "Message not Found");
    if(message.sender.toString() !== req.user._id.toString()) throw new apiError(403, "You can only deltet your own Message");

    message.isDeleted = true;
    message.expiresAt = new Date(Date.now() + 24*60*60*1000);
    await message.save();

    return res.status(200).json(
        new apiResponse(200, {}, "Message Deleteed Successfully. It will be Permanently Removed in 24 hours")
    );
});

// TTL
const updateMessageTTL = asyncHandler(async (req, res) =>{
    const {messageId} = req.params;
    const {ttlMinutes} = req.body;

    const message = await Message.findById(messageId);
    if(!message) throw new apiError(404, "Message not Found");

    //only sender can update TTL
    if(message.sender.toString() !== req.user._id.toString()) throw new apiError(403, "Not Authorized");
    if(ttlMinutes === null || ttlMinutes === 0) message.expiresAt = undefined;
    else message.expiresAt = new Date(Date.now() + ttlMinutes*60*1000);

    await message.save();

    return res.status(200).json(
        new apiResponse(200, message, "TTL updated Successfully")
    );
})

export {
    sendMessage,
    getChannelMessages,
    editMessage,
    deleteMessage,
    updateMessageTTL
};