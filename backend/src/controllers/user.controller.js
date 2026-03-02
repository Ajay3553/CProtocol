import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
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
    await user.save();
    await sendWelcomeEmail(user.email, user.fullName);
    return res.status(200).json(
        new apiResponse(200, null, "Email Verified Successfully")
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

    await sendLoginEmailWarning(
        user.email,
        user.fullName,
        req.headers["user-agent"],
        "Location unavailable",
        new Date().toLocaleString()
    );

    return res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse(200, { accessToken, refreshToken }, "Login verified successfully"));
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

    // const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    // user.verificationToken = verificationToken;
    // user.verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    // user.isVerified = false;

    // await sendVerificationEmail(user.email, verificationToken);

    // return res.status(200).json(
    //     new apiResponse(200, null, "OTP sent to email. Please verify to complete login.")
    // );

    /* Using it Just For Testing */
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

const changeCurrentPassword  = asyncHandler(async (req, res) =>{
    const {oldPassword, newPassword, confirmPassword} = req.body;
    if(newPassword !== confirmPassword) throw new apiError(400, "New Password and Confirm Password must be same");

    const user = await User.findById(req.user?._id);
    const isCorrectPassword = await user.isPasswordCorrect(oldPassword);
    if(!isCorrectPassword) throw new apiError(401, "Entered Current Password is Wrong!");

    user.password = newPassword;
    await user.save({validateBeforeSave: false});
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {},
            "Password Change Successfully"
        )
    )
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

export {
    registerUser,
    verifyEmail,
    loginUser,
    verifyLoginEmail,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser
}