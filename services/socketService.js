const db = require('../sequelize/models')
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { getUserDetailsFromDB } = require('./userService.js')

const getMeetingDetailsFromDB = async (meetingId) => {

    return await db.Meeting.findOne({ where: { Id: meetingId }, raw: true })

}
const updateMeetingDetailsToDB = async (meetingId, data) => {

    await db.Meeting.update(data, {
        where: {
            Id: meetingId
        }
    })
    return;

}
/**
 * cachedListOfMeeting format wil be 
 * {
    'meetingId': {
        host: 'anurag.nitp2@gmail.com',
        hostSocket: ws,
        participant: [
            {
                name: 'Anurag',
                id: 'randomNumber'
            }
        ]
    }
}
 */
const cachedListOfMeeting = {}

const handleRaiseHand = async (meetingId, MeetingDetails, participantId) => {
    // raise hand by the participant, show this to host on UI
    let participantDetails = cachedListOfMeeting[meetingId].participant.filter((participant) => participant.id == participantId);
    let data = {
        msg: `Hand raised by participant ${participantDetails[0].name}`,
        participantId: participantId,
        type: 'RAISEHAND'
    }
    // update hand raised in the DB.
    let handRaisedList = MeetingDetails.handRaised ? MeetingDetails.handRaised : [];
    handRaisedList.push({
        date: new Date(),
        name: participantDetails[0].name
    })
    await updateMeetingDetailsToDB(meetingId, { handRaised: handRaisedList });
    cachedListOfMeeting[meetingId].hostSocket.send(JSON.stringify({ data: data }));
}

const handleEndCall = async (meetingId) => {
    let data = {
        type: 'ENDCALL',
        msg: 'Call ended by the Host',
    };
    // update end date in our DB
    await updateMeetingDetailsToDB(meetingId, { endDate: new Date() });
    await broadcastMeetingMessage(meetingId, data);
}
const handleParticipantLeftTheCall = async (meetingId, participantId) => {
    let activeParticipantList = cachedListOfMeeting[meetingId].participant;
    // update our list and remove the user who left the meeting.
    let leftUserDetails = activeParticipantList.find((participant) => participant.id == participantId)
    activeParticipantList = activeParticipantList.filter((participant) => participant.id != participantId);
    let newMeetingDetails = {
        activeParticipant: activeParticipantList
    }
    // update the new list of active participant to our DB.
    await updateMeetingDetailsToDB(meetingId, newMeetingDetails)
    let participantListForClient = [];
    activeParticipantList.forEach((participant) => {
        if (participant && participant.wsDetail.readyState === 1) participantListForClient.push({ id: participant.id, name: participant.name });
    });
    let data = {
        type: 'LEFTCALL',
        participant: participantListForClient,
        msg: `Call left by the ${leftUserDetails.name || 'User'}`,
    }
    await broadcastMeetingMessage(meetingId, data);
}
const handleTimer = async (meetingId, MeetingDetails, updateTimerToDB, clientMsg) => {
    // update database for timer started
    console.log('updateTimerToDB is', updateTimerToDB);
    if (updateTimerToDB) {
        let timerCounterDb = MeetingDetails.timerCounter ? MeetingDetails.timerCounter : [];
        timerCounterDb.push({ date: new Date(), time: updateTimerToDB, })
        let newMeetingDetails = {
            timerCounter: timerCounterDb,
        }
        console.log('newMeetingDetails is ', newMeetingDetails);
        // update the new list to our DB
        await updateMeetingDetailsToDB(meetingId, newMeetingDetails)
    }

    let data = {
        msg: '',
        timeLeft: clientMsg,
        type: 'TIMER'
    }
    await broadcastMeetingMessage(meetingId, data);
}
const handleWebsocketMessage = async (ws) => {
    ws.on('message', async (body) => {
        console.log('message received', body);
        let { meetingId, clientMsg, type, participantId, userType, updateTimerToDB } = JSON.parse(body);
        let MeetingDetails = await getMeetingDetailsFromDB(meetingId);
        if (!MeetingDetails || !cachedListOfMeeting[meetingId]) {
            // meeting ended by the host 
            data = {
                msg: 'meeting is ended by the Host',
                isMeetingEnd: true,
            }
            ws.send(JSON.stringify({ data: data }));
        } else {
            if (type === 'RAISEHAND') {
                await handleRaiseHand(meetingId, MeetingDetails, participantId)
            }
            else if (type === 'ENDCALL') {
                await handleEndCall(meetingId)
            } else if (type === 'LEFTCALL') {
                await handleParticipantLeftTheCall(meetingId, participantId)
            } else {
                // type : Timer started by the Host
                handleTimer(meetingId, MeetingDetails, updateTimerToDB, clientMsg)
            }
        }
    });
}
/**
 * 
 * @param meetingId - meetingId
 * @param data - data that needs to broadcase
 */
const broadcastMeetingMessage = async (meetingId, data) => {
    let MeetingDetails = await getMeetingDetailsFromDB(meetingId);
    if (MeetingDetails && cachedListOfMeeting[meetingId]) {
        cachedListOfMeeting[meetingId].participant.forEach((client) => {
            if (client && client.wsDetail.readyState == 1) {
                // client.send(message);
                console.log('data is ', data);
                client.wsDetail.send(JSON.stringify({ data: data }));
            }
        });
    }
    cachedListOfMeeting[meetingId].hostSocket.send(JSON.stringify({ data: data }));

}

const createInstantMeeting = async (ws, meetingId, email) => {
    let participantList = [];
    let MeetingDetails = await getMeetingDetailsFromDB(meetingId);
    if (!MeetingDetails) await broadcastMeetingMessage(meetingId, { msg: 'Meeting doesnt exist' });
    else {

        const { response: userDetails, error } = await getUserDetailsFromDB(MeetingDetails.host);
        let newMeetingDetails = {
            participant: [],
            startDate: new Date(),
            meetingType: 'INSTANT',
            host: email
        }
        // adding the new meeting
        cachedListOfMeeting[meetingId] = {
            hostSocket: ws,
            participant: [],
            host: email
        }
        // update meeting started by host
        await updateMeetingDetailsToDB(meetingId, newMeetingDetails)

        let data = {
            msg: 'Meeting started',
            participant: participantList,
            meetingId: meetingId,
            host: cachedListOfMeeting[meetingId].host,
            hostName: userDetails.name
        }

        await broadcastMeetingMessage(meetingId, data);

    }

}

const hostRejoinedMeeting = async (ws, meetingId, email) => {
    // email to check host authorization.
    let MeetingDetails = await getMeetingDetailsFromDB(meetingId);
    if (MeetingDetails.host !== email)
        await broadcastMeetingMessage(meetingId, { msg: 'Unautorize Access to join meeting' });
    else {
        let participantList = [];
        let rawParticipantListForDB = [];
        console.log('cachedListOfMeeting[meetingId] is ', cachedListOfMeeting[meetingId]);
        rawParticipantListForDB = cachedListOfMeeting[meetingId] && cachedListOfMeeting[meetingId].participant.filter((participant) => participant.wsDetail.readyState !== 1
        ) || [];
        participantList = rawParticipantListForDB.map((participant) => {
            if (participant.wsDetail.readyState === 1) return { id: participant.id, name: participant.name }
        });
        cachedListOfMeeting[meetingId].participant = rawParticipantListForDB
        cachedListOfMeeting[meetingId].hostSocket = ws;

        // broadcast message
        let data = {
            msg: 'Weclome to the Meeting',
            participant: participantList,
            meetingId: meetingId,
            host: cachedListOfMeeting[meetingId].host,

        }
        console.log('meeting rejoined', data);
        await broadcastMeetingMessage(meetingId, data)
    }
}

const addParticipantToMeeting = async (ws, meetingId, participantName) => {
    let newUserId = uuidv4();
    let MeetingDetails = await getMeetingDetailsFromDB(meetingId);

    let rawActiveParticipantListForDB = [...cachedListOfMeeting[meetingId].participant, {
        name: participantName,
        id: newUserId,
        wsDetail: ws
    }];
    let newListOfParticipant = MeetingDetails.participant ? MeetingDetails.participant : [];
    newListOfParticipant.push({
        name: participantName,
        id: newUserId
    })
    rawActiveParticipantListForDB = rawActiveParticipantListForDB.filter((participant) => {
        if ((participant && participant.wsDetail.readyState === 0) || (participant && participant.wsDetail.readyState === 1)) {
            return participant;
        }
    }
    )
    cachedListOfMeeting[meetingId].participant = rawActiveParticipantListForDB
    let newMeetingDetails = {
        participant: newListOfParticipant,
    }
    console.log('new list of particpant', newMeetingDetails)
    await updateMeetingDetailsToDB(meetingId, newMeetingDetails);

    let participantList = [];
    rawActiveParticipantListForDB.forEach((participant) => {
        if (participant && participant.wsDetail.readyState == 1) participantList.push({ id: participant.id, name: participant.name });
    });
    const { response: userDetails, error } = await getUserDetailsFromDB(MeetingDetails.host);
    console.log('participantList is ', participantList);
    let data = {
        msg: `${participantName} joined the meeting`,
        participant: participantList,
        meetingId: meetingId,
        hostName: userDetails.data.name
    }
    // incase of new participant broadcast a new list of participant;
    await broadcastMeetingMessage(meetingId, data);
    // send user id to the user to store in the client side
    ws.send(JSON.stringify({ data: { meetingId: meetingId, participantId: newUserId } }));

}
module.exports = {
    handleWebsocketMessage,
    cachedListOfMeeting,
    broadcastMeetingMessage,
    createInstantMeeting,
    hostRejoinedMeeting,
    addParticipantToMeeting
}