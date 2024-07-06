const mongoose = require('mongoose');

const meetingSchema = mongoose.Schema({
    creator: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, 'creator is a required field']
    },
    meetingTopic: {
        type: String,
        required: [true, 'meetingTopic is a required field']
    },
    meetingCode: {
        type: String,
        required: [true, 'meetingCode is a required field']
    },
    private: {
        type: Boolean,
        default: false
    },
    meetingDateAndTime: {
        type: Date,
        required: [true, 'meetingDateAndTime is a required field']
    }
}, {timestamps: true});

const meetingModel = mongoose.model("Meeting", meetingSchema);

module.exports = meetingModel;