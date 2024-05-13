
const db = require('../sequelize/models');
const { getUserDetailsFromDB } = require('../services/userService')
const { Op } = require('sequelize');
var randomstring = require("randomstring");
const getListOfMeetingtService = async (pageSize, start, meetingType, email) => {
    try {
        let query ={host: email, meetingType:'INSTANT'};
        if(meetingType)
            query['meetingType'] = meetingType
        console.log('query is ', query);
        const dbData = await db.Meeting.findAll({
            where: {...query},
            order: [['createdAt', 'ASC']],
            offset: start,
            limit: pageSize,
            raw: true
        });
        const totalCount = await db.Meeting.count({   where: {...query}, });
        if (!dbData) {
            return {
                statusCode: 400,
                response: { msg: `No Meeting Record found`, error: true }
            }
        }
        return {
            statusCode: 200,
            response: { data: dbData, totalCount, currentCount: dbData.length, error: false }
        }
    }
    catch (e) {
        console.log('eror occured', e);
        return {
            statusCode: 500,
            response: { error: true, msg: 'Internal Server Error' }
        }
    }
}
const createMeetingService = async (body, email) => {
    try {
        console.log('body is ', body);
        const {type, startDate, endDate } = body;
        const { response: userDetails, error } = await getUserDetailsFromDB(email);
        if (error) return {
            statusCode: 401,
            response: { error: true, msg: 'Unauthorized Creation of Meeting' }
        }
        console.log('user details is ', userDetails);
        const randomMeetingId = randomstring.generate({
            length: 12,
            charset: ['alphabetic', '-'],
        });
        let dataToInsert = {
            Id: randomMeetingId,
            meetingType: type,
            startDate: startDate,
            endDate: endDate,
            name: userDetails.data.name,
            host: email,
        }
        const dbResponse = await db.Meeting.create(dataToInsert);
        let msg = 'meeting started'
        if(type == 'SCHEDULE') msg = `meeting scheduled on ${(new Date(startDate)).toLocaleString()}`
        if (dbResponse) {
            return {
                statusCode: 201,
                response: { msg: msg, error: false, meetingId: randomMeetingId }
            }
        } else {
            return {
                statusCode: 500,
                response: { error: true, msg: 'Internal Server Error' }
            }
        }
    }
    catch (e) {
        console.log('eror occured', e);
        return {
            statusCode: 500,
            response: { error: true, msg: 'Internal Server Error' }
        }
    }
}
const getMeetingDetailsService = async (meetingId) => {
    try {
        const meetingDetails = await db.Meeting.findOne({ where: { Id: meetingId }, raw: true })
        if (!meetingDetails) {
            return {
                statusCode: 400,
                response: { msg: `No Meeting found with the id ${meetingId}`, error: true }
            }
        }
        return {
            statusCode: 200,
            response: { data: meetingDetails, msg: 'meeting started', error: false }
        }
    }
    catch (e) {
        console.log('eror occured', e);
        return {
            statusCode: 500,
            response: { error: true, msg: 'Internal Server Error' }
        }
    }
}
module.exports = {
    getListOfMeetingtService,
    createMeetingService,
    getMeetingDetailsService
}