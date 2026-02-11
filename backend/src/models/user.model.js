import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const userSchema = new Schema({
    username : {
        type : String,
        required: true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },

    email : {
        type : String,
        required : true,
        unique : true,
        lowercase: true,
        trim : true
    },

    fullName : {
        type : String,
        required : true,
        trim : true,
        index : true
    },

    avatar: {
        type : String, // from Cloudinary
        default : "https://res.cloudinary.com/desezcpuj/image/upload/v1769951471/userDefaultAvatar_mdcdto.jpg"
    },

    password : {
        type: String,
        required : [true, "Password is Required"],
    },

    refreshToken : {
        type: String
    },

    verificationToken:{
        type: String
    },
    
    verificationTokenExpiry: {
        type: Date
    },

    isVerified : {  //email OTP verification
        type: Boolean,
        default: false
    },

    role : {
        type: String,
        enum : ["Admin", "Operations", "Agent", "Observer"],
        default : "Agent",
    }
}, {timestamps : true})

userSchema.pre("save", async function(){
    if(this.isModified("password")) this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email: this.email,
            username : this.username,
            fullName: this.fullName,
            role: this.role
        },

        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);