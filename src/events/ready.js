const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../../data/sequelize");
//schemas
const mailboxSchema = require("../../utils/models/mailboxes-schema")(sequelize,DataTypes);

//timers
const games = require('../auto/games');
module.exports = {
	name: 'ready',
	execute(client) {
		console.log(`Logged In as ${client.user.tag}`);
		try{
			mailboxSchema.sync();
		}
		catch(err){
			console.log(err);
		}
		finally{
			console.log("schema synced");
		}
		games.execute();
	},
};