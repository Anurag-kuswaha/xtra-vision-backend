
// verify user Access Token and set the username and userType  
exports.verifyUser = async (req, res, next) => {
  const { authorization } = req.headers;
  if (typeof authorization !== "undefined") {
    const token = authorization.split(" ")[1];
    if(token == 'null') {
      return res.status(401).send('Incorrect authorization token');
    } else{
      req.email = token;
    }
  } else {
    return res.status(401).send('bearer token is required');
  }
  next();
};
