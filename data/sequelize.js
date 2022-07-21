const { Sequelize } = require("sequelize");
const config = require("../config");
const fs = require("fs");

module.exports = new Sequelize(
  config.Database,
  config.Username,
  config.Password,
  {
    host: config.Hostname,
    port: config.Port,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        ca: fs.readFileSync("./utils/ca-certificate.crt").toString(),
      },
      native: true,
    },
  }
);

