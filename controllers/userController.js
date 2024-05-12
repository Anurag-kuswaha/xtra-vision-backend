const { signupUserService, loginUserService } = require('../services/userService')

const signupUser = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ error: true, msg: 'data is missing' });
    }
    const { statusCode, response } = await signupUserService(req.body);
    return res.status(statusCode).send(response);
}
const loginUser = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ error: true, msg: 'data is missing' });
    }
    const { statusCode, response } = await loginUserService(req.body);
    return res.status(statusCode).send(response);
}


module.exports = {
    signupUser,
    loginUser,
}