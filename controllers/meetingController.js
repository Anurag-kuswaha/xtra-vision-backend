const { getListOfMeetingtService, createMeetingService, getMeetingDetailsService } = require('../Services/meetingService')

const getListOfMeeting = async (req, res) => {
    let pageSize = req.query.pSize ? Number(req.query.pSize) : 10;
    let start = req.query.page ? pageSize * (Number(req.query.page) - 1) : 0;
    let meetingType = req.query.type ? decodeURIComponent(req.query.type) : null

    const { statusCode, response } = await getListOfMeetingtService(pageSize, start, meetingType, req.email);
    return res.status(statusCode).send(response);
}
const createMeeting = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ error: true, msg: 'data is missing' });
    }
    const { statusCode, response } = await createMeetingService(req.body, req.email);
    return res.status(statusCode).send(response);
}
const getMeetingDetails = async (req, res) => {
    if (!req.params.meetingId) {
        return res.status(400).send({ error: true, msg: 'missing Meeting Id' });
    }
    const { statusCode, response } = await getMeetingDetailsService(req.params.meetingId);
    return res.status(statusCode).send(response);
}
module.exports = {
    createMeeting,
    getListOfMeeting,
    getMeetingDetails
}