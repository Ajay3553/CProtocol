import { Channel } from "../models/channel.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { getId } from "../socket/socket.js";


const createChannel = asyncHandler(async (req, res) => {
    const { name, type, participants, creatorEncryptedKey, isEncrypted, encryptionMetadata } = req.body;

    if (!Array.isArray(participants)) throw new apiError(400, "Participants must be an array");
    if (type === "direct" && participants.length !== 1) throw new apiError(400, "Direct channel must contain exactly 2 users including creater");

    const usernames = [];
    const keyMap = {};

    participants.forEach(p => {
        if (typeof p === "string") {
            usernames.push(p);
        } else if (p && typeof p === "object" && p.username) {
            usernames.push(p.username);
            if (p.encryptedKey) keyMap[p.username.toLowerCase()] = p.encryptedKey;
        }
    });

    const resolvedUsers = await User.find({ username: { $in: usernames } });
    if (type === "direct" && resolvedUsers.length !== 1) throw new apiError(404, "Participant username not found");

    const formatedParticipants = resolvedUsers.map(u => ({
        user: u._id,
        channelRole: "Agent",
        encryptedKey: keyMap[u.username.toLowerCase()] || ""
    }));

    formatedParticipants.push({
        user: req.user._id,
        channelRole: "Admin",
        encryptedKey: creatorEncryptedKey || ""
    });

    const channel = await Channel.create({
        name,
        type,
        participants: formatedParticipants,
        createdBy: req.user._id,
        isEncrypted: isEncrypted !== undefined ? isEncrypted : true,
        encryptionMetadata: encryptionMetadata || {
            algorithm: "AES-256-CBC",
            keyExchange: "RSA-2048",
            version: 1
        }
    });

    await channel.populate("participants.user", "username fullName avatar email role publicKey");

    const io = getId();
    channel.participants.forEach(p => {
        io.to(`user:${(p.user._id || p.user).toString()}`).emit("channel:created", channel);
    });

    return res.status(201).json(
        new apiResponse(201, channel, "Channel created successfully")
    );
});


const getUserChannels = asyncHandler(async (req, res) => {
    const channels = await Channel.find({
        "participants.user" : req.user._id
    }).populate("lastMessage")
    .populate("participants.user", "username fullName avatar email role publicKey")
    .sort({updatedAt: -1});

    return res.status(200).json(
        new apiResponse(200, channels, "User Channels Fetched")
    );
});


const getChannelDetails = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId)
        .populate("participants.user", "username fullName avatar email role publicKey");

    if(!channel) throw new apiError(404, "Channel not Found");

    const isParticipant = channel.participants.some(
        p => p.user._id.toString() === req.user._id.toString()
    );
    if(!isParticipant) throw new apiError(403, "Access denied");

    return res.status(200).json(
        new apiResponse(200, channel, "Channel details fetched")
    );
});


const addParticipants = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    const {username, encryptedKey} = req.body;

    const user = await User.findOne({ username });
    if(!user) throw new apiError(404, "User not found");

    const userId = user._id;

    const channel = await Channel.findById(channelId);
    if(!channel) throw new apiError(404, "Channel not Found");

    const requester = channel.participants.find(
        p => p.user.toString() === req.user._id.toString()
    );
    if(!requester || requester.channelRole !== "Admin") throw new apiError(403, "Only Admin can add participants");

    const alreadyMember = channel.participants.some(
        p => p.user.toString() === userId.toString()
    );
    if(alreadyMember) throw new apiError(400, "User already in channel");

    channel.participants.push({
        user: userId,
        channelRole: "Agent",
        encryptedKey: encryptedKey || ""
    });

    await channel.save();
    await channel.populate("participants.user", "username fullName avatar email role publicKey");
    await channel.populate("lastMessage");

    const io = getId();
    channel.participants.forEach(p => {
        io.to(`user:${(p.user._id || p.user).toString()}`).emit("channel:updated", channel);
    });
    io.to(`user:${userId.toString()}`).emit("channel:created", channel);

    return res.status(200).json(
        new apiResponse(200, channel, "Participant added")
    );
});


const removeParticipant = asyncHandler(async(req, res) => {
    const {channelId} = req.params;
    const {userId} = req.body;

    const channel = await Channel.findById(channelId);
    if(!channel) throw new apiError(404, "Channel not Found");

    const requester = channel.participants.find(
        p => p.user.toString() === req.user._id.toString()
    );
    if(!requester || requester.channelRole !== "Admin") throw new apiError(403, "Only Admin can remove participants");

    channel.participants = channel.participants.filter(
        p => p.user.toString() !== userId
    );

    await channel.save();
    await channel.populate("participants.user", "username fullName avatar email role publicKey");
    await channel.populate("lastMessage");

    const io = getId();
    channel.participants.forEach(p => {
        io.to(`user:${(p.user._id || p.user).toString()}`).emit("channel:updated", channel);
    });
    io.to(`user:${userId.toString()}`).emit("channel:removed", { channelId });

    return res.status(200).json(
        new apiResponse(200, channel, "Participant removed")
    );
});


const updateParticipantRole = asyncHandler(async(req, res) => {
    const {channelId} = req.params;
    const {userId, role} = req.body;

    if(role === "Admin") throw new apiError(400, "Only One Admin is Valid for One Channel");

    const channel = await Channel.findById(channelId);
    if(!channel) throw new apiError(404, "Channel not Found");

    const requester = channel.participants.find(
        p => p.user.toString() === req.user._id.toString()
    );
    if(!requester || requester.channelRole !== "Admin") throw new apiError(403, "Only Admin can change Roles");

    const participant = channel.participants.find(
        p => p.user.toString() === userId
    );
    if(!participant) throw new apiError(404, "Participant not Found");

    participant.channelRole = role;

    await channel.save();
    await channel.populate("participants.user", "username fullName avatar email role publicKey");
    await channel.populate("lastMessage");

    const io = getId();
    channel.participants.forEach(p => {
        io.to(`user:${(p.user._id || p.user).toString()}`).emit("channel:updated", channel);
    });

    return res.status(200).json(
        new apiResponse(200, channel, "Role Updated")
    );
});


const deleteChannel = asyncHandler(async(req, res) => {
    const {channelId} = req.params;
    const channel = await Channel.findById(channelId);
    if(!channel) throw new apiError(404, "Channel not Found");

    const requester = channel.participants.find(
        p => p.user.toString() === req.user._id.toString()
    );
    if(!requester || requester.channelRole !== "Admin") throw new apiError(403, "Only Admin can Delete Channel");

    const io = getId();
    channel.participants.forEach(p => {
        io.to(`user:${p.user.toString()}`).emit("channel:removed", { channelId });
    });

    await channel.deleteOne();

    return res.status(200).json(
        new apiResponse(200, {}, "Channel Deleted")
    );
});


const updateChannel = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { name } = req.body;

    const channel = await Channel.findById(channelId);
    if(!channel) throw new apiError(404, "Channel not Found");

    const requester = channel.participants.find(
        p => p.user.toString() === req.user._id.toString()
    );
    if(!requester || requester.channelRole !== "Admin") throw new apiError(403, "Only Admin can update channel");

    if(name && name.trim()) channel.name = name.trim();

    if(req.files?.avatar?.[0]?.path){
        const uploaded = await uploadOnCloudinary(req.files.avatar[0].path);
        if(uploaded?.url) channel.avatar = uploaded.url;
    }

    await channel.save();
    await channel.populate("participants.user", "username fullName avatar email role publicKey");
    await channel.populate("lastMessage");

    const io = getId();
    channel.participants.forEach(p => {
        io.to(`user:${(p.user._id || p.user).toString()}`).emit("channel:updated", channel);
    });

    return res.status(200).json(
        new apiResponse(200, channel, "Channel updated")
    );
});


export {
    createChannel,
    getUserChannels,
    getChannelDetails,
    addParticipants,
    removeParticipant,
    updateParticipantRole,
    deleteChannel,
    updateChannel,
};