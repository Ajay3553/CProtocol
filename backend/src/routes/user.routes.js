import { Router } from 'express';
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, registerUser, resendVerifyEmail, updateUserData, verifyChangePasswordOTP, verifyEmail, verifyLoginEmail, updatePublicKey, getUserPublicKey } from '../controllers/user.controller.js';
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
router.route('/resend-verify-email').post(resendVerifyEmail);

// protected
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/change-password').post(verifyJWT, changeCurrentPassword);
router.route('/verify-change-password-otp').post(verifyJWT, verifyChangePasswordOTP);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/public-key').patch(verifyJWT, updatePublicKey);
router.route('/public-key/:username').get(verifyJWT, getUserPublicKey);
router.route('/update-data').patch(
    verifyJWT,
    upload.fields(
        [
            {
                name: "avatar",
                maxCount: 1
            }
        ]
    ),
    updateUserData
);

export default router;