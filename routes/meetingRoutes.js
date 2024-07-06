const express = require('express');
const router = express.Router();
const { newMeeting, isValidMeetingCode, myMeetings, deleteMeeting } = require('../controllers/meeting');

router.post('/new-meeting', newMeeting);
router.post('/is-valid-meeting-code', isValidMeetingCode);
router.get('/my-meetings', myMeetings);
router.post('/delete-meeting', deleteMeeting);

module.exports = router;
