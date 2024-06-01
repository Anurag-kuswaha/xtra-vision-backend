
const express = require('express');
const cors = require('cors');
const dotenv  = require("dotenv");
dotenv.config()
const app = express();
const routes = require('./routes');
const expressWs = require('express-ws');
expressWs(app);
const db = require("./sequelize/models");
const webSocketRoutes = require('./socketRoutes');
try {
    app.use(cors());
    app.use(express.json());
    //initialize sequelize
    (async () => {
        try {
            const eraseDatabaseOnSync = false;
            const alterDatabaseOnSync = false;
            await db.sequelize.sync({ alter: alterDatabaseOnSync, force: eraseDatabaseOnSync })
        }
        catch (e) {
            console.log('error while syncing with database', e);
        }
    })();
    app.use(webSocketRoutes)
    app.use(routes);
    app.use((err, req, res, next) => {
        console.log('error handling endpoint');
        res.status(500).send({ error: true, msg: 'Invalid endpoint' });
        next(err);
    });
    const port = process.env.port || 3001;
    app.listen(port, (e) => {
        console.log(`Backend server is running on port ${port}`)
    })
}
catch (e) {
    console.log('error is ', e);
}
module.exports = app
