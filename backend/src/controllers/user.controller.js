import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import { sendLoginEmailWarning, sendVerificationEmail, sendWelcomeEmail } from '../middleware/emailVerification.middleware.js'


const options = {
    httpOnly : true,
    secure : false,
    sameSite : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
}

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken};
    } catch (e) {
        throw new apiError(500, "Something went wrong while generateing Access and Refresh Token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {fullName, username, email, password} = req.body; // from frontend
    if([fullName, email, username, password].some(field => !field || field.trim() === "")){
        throw new apiError(400, "All Fields are Required")
    }

    const existedUser = await User.findOne({
        $or : [{username}, {email}]
    })

    if(existedUser) throw new apiError(400, "User with Email or Username already Exist"); // validate
    
    let avatarURL;
    if(req.files?.avatar?.[0]?.path){
        const avatar = await uploadOnCloudinary(req.files?.avatar?.[0]?.path);
        avatarURL = avatar?.url;
    }

    const verificationToken = Math.floor(100000 + Math.random()*900000).toString();

    const user = await User.create({
        fullName,
        avatar: avatarURL,
        email,
        password,
        username: username.toLowerCase(),
        verificationToken: verificationToken,
        verificationTokenExpiry : new Date(Date.now() + 10 * 60 * 1000)
    })
    
    await sendVerificationEmail(email, verificationToken);

    const createdUser  = await User.findById(user._id).select( // restrinct Password and refreshToken sending to DB
        "-password -refreshToken"
    )

    if(!createdUser) throw new apiError(500, "Something Went Wrong Wile Registering the User"); // validation
    
    return res.status(201).json(
        new apiResponse(201, createdUser, "User Registered Successfully")
    )
});

const verifyEmail = asyncHandler(async(req, res) => {
    const {userEnterToken} = req.body;
    const user = await User.findOne({
        verificationToken: userEnterToken,
        verificationTokenExpiry: { $gt: new Date() }
    });
    if(!user) throw new apiError(400, "OTP is Wrong or Expired");
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    await user.save();
    await sendWelcomeEmail(user.email, user.fullName);
    return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(200, {accessToken, refreshToken}, "Verified Successfully")
    )
});

const verifyLoginEmail = asyncHandler(async (req, res) => {
    const { userEnterToken } = req.body;

    const user = await User.findOne({
        verificationToken: userEnterToken,
        verificationTokenExpiry: { $gt: new Date() }
    });

    if (!user) throw new apiError(400, "OTP is Wrong or Expired");

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    await user.save();
    // TODO : commented for testing
    // await sendLoginEmailWarning(
    //     user.email,
    //     user.fullName,
    //     req.headers["user-agent"],
    //     "Location unavailable",
    //     new Date().toLocaleString()
    // );

    return res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse(200, { accessToken, refreshToken }, "Login verified successfully"));
});

const resendVerifyEmail = asyncHandler(async (req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) throw new apiError(404, "User not found please try again");
    const verificationToken = Math.floor(100000 + Math.random()*900000).toString();
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = new Date(Date.now() + 10*60*1000);

    await user.save();

    await sendVerificationEmail(user.email, verificationToken);

    return res.status(200).json(
        new apiResponse(200, null, "OTP send Successfully")
    );
});


const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    if (!(username || email)) throw new apiError(400, "Username or Email Required");

    const credentials = [];
    if (username) credentials.push({ username });
    if (email) credentials.push({ email });

    const user = await User.findOne({ $or: credentials });
    if (!user) throw new apiError(404, "User not found");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new apiError(401, "Invalid credentials");

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    // user.verificationToken = verificationToken;
    // user.verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.isVerified = true;

    // await user.save();

    /* Using it Just For Testing */
    // await sendVerificationEmail(user.email, verificationToken);

    // return res.status(200).json(
    //     new apiResponse(200, null, "OTP sent to email. Please verify to complete login.")
    // );


    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    return res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse(200, { accessToken, refreshToken }, "Login verified successfully"));
});


const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined,
                isVerified : false
            }
        },
        {
            new : true
        }
    )

    return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(
        new apiResponse(
            200,
            {},
            "User Logged Out"
        )
    )
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
        throw new apiError(400, "New Password and Confirm Password must match");
    }

    const user = await User.findById(req.user._id);
    const isCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isCorrect) throw new apiError(401, "Current password is incorrect");

    // Generate OTP and store in existing verification fields
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationToken = otp;
    user.verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save({ validateBeforeSave: false });

    // Send OTP using your existing email function
    await sendVerificationEmail(user.email, otp);

    return res.status(200).json(
        new apiResponse(200, null, "OTP sent to your registered email. Please verify to complete password change.")
    );
});


const verifyChangePasswordOTP = asyncHandler(async (req, res) => {
    const { otp, newPassword } = req.body; // client must send newPassword again

    const user = await User.findById(req.user._id);
    if (!user) throw new apiError(404, "User not found");

    // Validate OTP
    if (!user.verificationToken || user.verificationToken !== otp) {
        throw new apiError(400, "Invalid OTP");
    }
    if (new Date() > user.verificationTokenExpiry) {
        throw new apiError(400, "OTP expired. Please request a new one.");
    }

    // Change password
    user.password = newPassword;
    // Clear OTP fields (so they can be reused later)
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    // Send warning email
    await sendLoginEmailWarning(
        user.email,
        user.fullName,
        req.headers["user-agent"] || "Unknown device",
        "IP unknown",
        new Date().toLocaleString()
    );

    return res.status(200).json(
        new apiResponse(200, null, "Password changed successfully")
    );
});


const getCurrentUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user?._id).select(
        "-password -refreshToken -verificationToken -verificationTokenExpiry"
    );
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            user,
            "Current User Fetched Successfully"
        )
    )
});

const updateUserData = asyncHandler(async (req, res) => {
    const { newFullName } = req.body;

    const user = await User.findById(req.user?._id);
    if (!user) throw new apiError(404, "User not found");

    if (newFullName?.trim()) {
        user.fullName = newFullName.trim();
    }

    if (req.files?.avatar?.[0]?.path) {
        const oldAvatarUrl = user.avatar;
        const uploaded = await uploadOnCloudinary(req.files.avatar[0].path);

        if (!uploaded?.url) {
            throw new apiError(500, "Failed to upload new avatar. Your current avatar is unchanged.");
        }
        user.avatar = uploaded.url;

        if(oldAvatarUrl) {
            deleteFromCloudinary(oldAvatarUrl).catch((err) =>
                console.error("Failed to delete old avatar from Cloudinary:", err)
            );
        }
    }

    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(user._id).select(
        "-password -refreshToken -verificationToken -verificationTokenExpiry"
    );

    return res.status(200).json(
        new apiResponse(200, updatedUser, "User data updated successfully")
    );
});

const updatePublicKey = asyncHandler(async (req, res) => {
    const { publicKey } = req.body;
    if (!publicKey) throw new apiError(400, "Public key is required");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                publicKey
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken -verificationToken -verificationTokenExpiry");

    if (!user) throw new apiError(404, "User not found");

    return res.status(200).json(
        new apiResponse(200, user, "Public key updated successfully")
    );
});

const getUserPublicKey = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username) throw new apiError(400, "Username is required");

    const user = await User.findOne({ username: username.toLowerCase() }).select(
        "username fullName avatar publicKey"
    );

    if (!user) throw new apiError(404, "User not found");

    return res.status(200).json(
        new apiResponse(200, {
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            avatar: user.avatar,
            publicKey: user.publicKey || ""
        }, "Public key fetched successfully")
    );
});

export {
    registerUser,
    verifyEmail,
    loginUser,
    verifyLoginEmail,
    resendVerifyEmail,
    verifyChangePasswordOTP,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateUserData,
    updatePublicKey,
    getUserPublicKey
}