const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Meeting extends Model {
        static associate(models) {
        }
    }
    Meeting.init({
        Id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        meetingType: DataTypes.STRING,
        startDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        endDate: {
            type: DataTypes.DATE,

        },
        name: DataTypes.STRING,
        // email id of the host
        host: DataTypes.STRING,
        // stats details of the meeting
        // stores participant list
        /**
         * {id, name, joinDate, endDate, numberOfHandRaised}
         */
        participant: {
            type: DataTypes.ARRAY(DataTypes.JSONB)
        },
        /**
         * list of time counter
         * {duration, participantName, participantId}
         */
        timerCounter: {
            type: DataTypes.ARRAY(DataTypes.JSONB)
        },
        handRaised: {
            type: DataTypes.ARRAY(DataTypes.JSONB)
        },

    }, {
        sequelize,
        modelName: 'Meeting',
    });
    return Meeting;
};
