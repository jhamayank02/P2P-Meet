const {v4:uuid} = require('uuid');
const meetingModel = require('../models/Meeting');
const { TryCatch } = require('../middlewares/error');

const newMeeting = TryCatch(async (req, res)=>{
    const {meetingTopic, meetingDateAndTime, isPrivate} = req.body;

    const meetingCode = uuid();

    const newMeeting = await meetingModel.create({
        creator: req.user.id,
        meetingTopic,
        meetingDateAndTime,
        isPrivate,
        meetingCode
    })

    res.status(200).json({
        status: 200,
        success: true,
        message: "Meeting scheduled successfully",
        meetingCode: meetingCode
    })
})

const isValidMeetingCode = TryCatch(async (req, res)=>{
    const {meetingCode} = req.body;

    const meeting = await meetingModel.findOne({meetingCode});

    if(meeting){
        return res.status(200).json({
            status: 200,
            success: true,
            message: "Meeting code is valid"
        })
    }

    return res.status(403).json({
        status: 403,
        success: false,
        message: "Meeting code is invalid"
    })
})

const myMeetings = TryCatch(async (req, res)=>{
    const meetings = await meetingModel.find({creator: req.user.id}).sort({createdAt: -1});

    res.status(200).json({
        status: 200,
        success: true,
        meetings
    })
})

const deleteMeeting = TryCatch(async (req, res)=>{
    const {meetingId} = req.body;

    const meeting = await meetingModel.findOne({_id: meetingId, creator: req.user.id});

    if(!meeting){
        return res.status(404).json({
            status: 404,
            success: false,
            message: "No meeting found"
        })
    }

    const today = new Date();
    const isPassed = (today.getTime() - meeting.meetingDateAndTime.getTime() >= 0);

    if(isPassed){
        return res.status(200).json({
            status: 200,
            success: false,
            message: "You can't delete past meetings"
        })
    }

    await meetingModel.deleteOne({_id: meeting._id});

    res.status(200).json({
        status: 200,
        success: true,
        message: "Meeting deleted successfully"
    })
})

module.exports = {newMeeting, isValidMeetingCode, myMeetings, deleteMeeting};