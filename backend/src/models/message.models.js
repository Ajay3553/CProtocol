import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
    channel:{
        type: Schema.Types.ObjectId,
        ref: "Channel",
        required: true,
        index: true
    },

    sender:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    content:{
        type: String, // Encrypted ciphertext if channel.isEncrypted = true
        required: true
    },

    attachments:[
        {
            url:{
                type: String // cloudinary URL
            },
            type:{
                type: String // Img, Doc URL
            }
        }
    ],

    minVisibilityRole:{
        type: String,
        enum: ["Admin", "Operations", "Agent", "Observer"],
        default: "Observer"
    },

    hiddenFor:[
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    status:{
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent"
    },

    isEdited:{
        type: Boolean,
        default: false
    },

    isDeleted:{
        type: Boolean,
        default: false
    },

    expiresAt:{
        type: Date,
        index: {
            expires: 0 // TTL auto-delete (self destruct)
        }
    }
},{ timestamps: true });

export const Message = mongoose.model("Message", messageSchema);