import { Router } from "express";
import { verifyJWT} from "../middleware/auth.middleware.js";
import { sendMessage, getChannelMessages, editMessage, deleteMessage } from "../controllers/message.controller.js";

const router = Router();

// protected
router.route("/send").post(verifyJWT, sendMessage);
router.route("/channel-messages/:channelId").get(verifyJWT, getChannelMessages);
router.route("/edit/:messageId").patch(verifyJWT, editMessage);
router.route("/delete/:messageId").delete(verifyJWT, deleteMessage);

export default router;