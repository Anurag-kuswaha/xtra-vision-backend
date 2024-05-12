const { Router } = require('express');
const router = Router();
const { handleWebsocketMessage, cachedListOfMeeting, createInstantMeeting, hostRejoinedMeeting, addParticipantToMeeting } = require('./services/socketService')

/**
 * test host url: websocket/meetingId=123&host=true&email=anurag.nitp2@gmail.com
 * test participant url: websocket/meetingId=123&name=shibu
 */
router.ws('/websocket/', async (ws, req) => {
    try {
        let meetingId = decodeURIComponent(req.query.meetingId);
        let isHost = req.query.host ? decodeURIComponent(req.query.host) : false;
        let email = isHost ? decodeURIComponent(req.query.email) : null
        let participantName = !isHost ? decodeURIComponent(req.query.name) : 'N/A';
        console.log('meeting id ', meetingId);
        console.log('isHost is ', isHost);
        // user type is host
        if (isHost) {
            // meeting is already started and host left due to connection error
            if (cachedListOfMeeting && meetingId in cachedListOfMeeting) {
                await hostRejoinedMeeting(ws, meetingId, email)
            } else {
                // create instant meeting
                await createInstantMeeting(ws, meetingId, email)
            }
        }
        // user is participant
        else {
            console.log('meetingId in Meetings ', meetingId in cachedListOfMeeting);
            // add participant to the meeting
            if (cachedListOfMeeting && meetingId in cachedListOfMeeting) {
                await addParticipantToMeeting(ws, meetingId, participantName)
            } else {
                // closing connection since host is not joined yet.
                let msg = 'Meeting is not started yet, please wait for the host to join the meeting';
                let data = {
                    msg: msg,
                    isConnectionClosed: true,
                    participant: [],
                    meetingId: meetingId
                }
                ws.send(JSON.stringify({ data: data }));
                ws.close();
            }
        }
        // on message recevied from client
        await handleWebsocketMessage(ws);
        ws.on('close', () => {
            console.log('closing connection ...');
        });
    } catch (error) {
        console.log('error is', error);
    }
});

module.exports = router;
