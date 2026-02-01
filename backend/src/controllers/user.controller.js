import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import { sendVerificationEmail, sendWelcomeEmail } from '../middleware/emailVerification.middleware.js'

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
})

export {
    registerUser,
    verifyEmail
}