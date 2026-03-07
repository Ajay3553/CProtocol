import mongoose, { Schema } from "mongoose";

const participantSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    channelRole:{
        type: String,
        enum: ["Admin", "Operations", "Agent", "Observer"],
        default: "Agent"
    }
},
{
    _id: false
});

const channelSchema = new Schema({
    name:{
        type: String,
        trim: true
    },

    type:{
        type: String,
        enum: ["direct", "group"],
        default: "group",
        required: true
    },

    participants:{
        type: [participantSchema],
        validate:{
        validator: function (participants){
                if (this.type === "direct" && participants.length !== 2){
                    return false;
                }
                return true;
            },
            message: "Direct channel must contain exactly 2 participants"
        }
    },

    isEncrypted:{
        type: Boolean,
        default: false
    },

    encryptionMetadata:{
        algorithm:{
            type: String
        },
        keyExchange:{
            type: String
        },
        version:{
            type: Number
        }
    },

    lastMessage:{
        type: Schema.Types.ObjectId,
        ref: "Message"
    },

    createdBy:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
    }, { timestamps: true });

// For fast channel lookup
channelSchema.index({ "participants.user": 1 });

export const Channel = mongoose.model("Channel", channelSchema);