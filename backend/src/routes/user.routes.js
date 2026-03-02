import { Router } from 'express';
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, registerUser, verifyEmail, verifyLoginEmail } from '../controllers/user.controller.js';
import { upload } from '../middleware/multer.middleware.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.route('/register').post(
    upload.fields(
        [
            {
                name: "avatar",
                maxCount: 1
            }
        ]
    ),
    registerUser
)

router.route('/verify-email').post(verifyEmail);
router.route('/login').post(loginUser);
router.route('/verify-login-email').post(verifyLoginEmail);

// protected
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/change-password').post(verifyJWT, changeCurrentPassword);
router.route('/current-user').get(verifyJWT, getCurrentUser);

export default router;