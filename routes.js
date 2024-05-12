const express = require('express');
const app = express();
const { verifyUser } = require('./middlewares/auth');
const { signupUser, loginUser } = require('./controllers/userController');
const { createMeeting, getListOfMeeting, getMeetingDetails } = require('./controllers/meetingController');
app.get('/', (req, res) => {
    return res.status(200).json({ msg: 'working fine', error: false });
})

app.post('/signup', signupUser)

app.post('/login', loginUser)

app.post('/createMeeting', verifyUser, createMeeting)

app.get('/meeting/list', verifyUser, getListOfMeeting)

app.get('/meeting/details/:meetingId', getMeetingDetails)


module.exports = app
