const { Sequelize, DataTypes, Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
	return sequelize.define('mailboxes', {
    MinecraftUsername: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location:{
      type: DataTypes.JSONB,
      allowNull: false,
    },
    DiscordID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    twitchName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mcUUID: {
      type: DataTypes.STRING,
      allowNull: false,
    }
	});
};