const process = require('process');
const database =  {
   "development": {
      "username": process.env.DB_USERNAME,
      "password": process.env.DB_PASSWORD,
      "host": process.env.DB_HOST,
      "port": process.env.DB_PORT,
      "database":process.env.DB_DATABASE,
      "dialect": process.env.DB_DIALECT,
      "ssl": true,
      "dialectOptions": {
         "ssl": {
            "require": true,
            "rejectUnauthorized": false
         }
      },
      "logging": false
   },
   "test": {},
   "production": {
      "username": process.env.DB_USERNAME,
      "password": process.env.DB_PASSWORD,
      "host": process.env.DB_HOST,
      "port": process.env.DB_PORT,
      "database":process.env.DB_DATABASE,
      "dialect": process.env.DB_DIALECT,
      "ssl": true,
      "dialectOptions": {
         "ssl": {
            "require": true,
            "rejectUnauthorized": false
         }
      },
      "logging": false
   }
}
module.exports =   database;
