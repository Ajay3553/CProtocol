import { Channel } from "../models/channel.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";


const createChannel = asyncHandler(async (req, res) => {
    const {name, type, participants} = req.body;

    if (!Array.isArray(participants)) throw new apiError(400, "Participants must be an array");  // ← CHANGED (fixed buggy validation)
    if (type === "direct" && participants.length !== 1) throw new apiError(400, "Direct channel must contain exactly 2 users including creater");

    const resolvedUsers = await User.find({ username: { $in: participants } });
    if (type === "direct" && resolvedUsers.length !== 1) throw new apiError(404, "Participant username not found");

    const formatedParticipants = resolvedUsers.map(u => ({  // ← CHANGED: use resolved user docs
        user: u._id,
        channelRole: "Agent"
    }));

    formatedParticipants.push({
        user: req.user._id,
        channelRole: "Admin"
    });

    const channel = await Channel.create({
        name,
        type,
        participants: formatedParticipants,
        createdBy: req.user._id
    });

    return res.status(201).json(
        new apiResponse(201, channel, "Channel created successfully")
    );
});


const getUserChannels = asyncHandler(async (req, res) => {
    const channels = await Channel.find({
        "participants.user" : req.user._id
    }).populate("lastMessage").sort({updatedAt: -1});
    return res.status(200).json(
        new apiResponse(200, channels, "User Channels Fetched")
    );
});


const getChannelDetails = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId).populate("participants.user", "username fullName avatar");
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
    const {username} = req.body;

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
        channelRole: "Agent"
    });

    await channel.save();

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

    await channel.deleteOne();

    return res.status(200).json(
        new apiResponse(200, {}, "Channel Deleted")
    );
});


export {
    createChannel,
    getUserChannels,
    getChannelDetails,
    addParticipants,
    removeParticipant,
    updateParticipantRole,
    deleteChannel
};