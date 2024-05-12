
const db = require('../sequelize/models')
const getUserDetailsFromDB = async (email) => {
    try {
        const dbData = await db.User.findByPk(email, { raw: true });
        console.log('dbData is', dbData);
        if (!dbData) {
            return {
                statusCode: 400,
                response: { msg: `No User found with this email ${email} `, error: true }
            }
        }
        return {
            statusCode: 200,
            response: { data: dbData, error: false }
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

const signupUserService = async (body) => {
    try {
        console.log('body is ', body);
        // const AccountUtils = require('../Utils/AccountUtils')
        // const { error } = AccountUtils.ValidateUserSchema({ ...body });
        // if (error) {
        //     return { response: { msg: error.details[0].message, error: true }, statusCode: 400 };
        // }
        const { email, name, password } = body;

        // check account exist or not.
        const dbData = await db.User.findByPk(email);
        if (dbData) {
            return {
                statusCode: 200,
                response: { msg: `Account already exist, please try logging in`, error: true }
            }

        }
        const dbResponse = await db.User.create(body, {
            email, name, password
        });
        return {
            statusCode: 201,
            response: { msg: 'Account created successfully', error: false, email: dbResponse.dataValues.email, name: dbResponse.dataValues.name }
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

const loginUserService = async (body) => {
    try {
        const { email, password } = body;
        const dbData = await db.User.findByPk(email);
        if (!dbData) {
            return {
                statusCode: 200,
                response: { msg: `Account doesn't exist, please try create one`, error: true }
            }
        }
        // authenciate password
        if (dbData.dataValues.password === password) {
            // password is correct, send details to store it in the localstorage
            return {
                statusCode: 200,
                response: { msg: 'Logged In successfully', error: false, email: dbData.dataValues.email, name: dbData.dataValues.name }
            }
        } else {
            return {
                statusCode: 400,
                response: { msg: 'Wrong Password', error: true }
            }
        }
    } catch (e) {

    }
}
module.exports = {
    signupUserService,
    loginUserService,
    getUserDetailsFromDB
}