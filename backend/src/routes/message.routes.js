import { Router } from "express";
import { verifyJWT} from "../middleware/auth.middleware.js";
import { sendMessage, getChannelMessages, editMessage, deleteMessage } from "../controllers/message.controller.js";

const router = Router();

// protected
router.route("/send").post(verifyJWT, sendMessage);
router.route("/channel-messages/:channelId").get(verifyJWT, getChannelMessages); //TODO: NEED TO FIX THIS ACCESS PART
router.route("/edit/:messageId").patch(verifyJWT, editMessage);
router.route("/delete/:messageId").delete(verifyJWT, deleteMessage); //TODO : NEED TO DELETE IT OR DELETE AFTER SOME TIME AND GIVE ACCESS TO USER TO RESTORE IT BACK

export default router;