import {Router} from "express";
import {verifyJWT} from "../middleware/auth.middleware.js";
import {addParticipants, createChannel, deleteChannel, getChannelDetails, getUserChannels, removeParticipant, updateParticipantRole, updateChannel} from "../controllers/channel.controller.js";
import {upload} from '../middleware/multer.middleware.js';

const router = Router();

router.route("/create").post(verifyJWT, createChannel);
router.route("/my-channels").get(verifyJWT, getUserChannels);
router.route("/:channelId").get(verifyJWT, getChannelDetails);
router.route("/:channelId/add").post(verifyJWT, addParticipants);
router.route("/:channelId/remove").post(verifyJWT, removeParticipant);
router.route("/:channelId/role").patch(verifyJWT, updateParticipantRole);
router.route("/:channelId/delete").delete(verifyJWT, deleteChannel);
router.route("/:channelId/update").patch(verifyJWT, upload.fields(
    [
        {
            name: "avatar",
            maxCount: 1
        }
    ]
), updateChannel);

export default router;