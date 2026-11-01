const { Sequelize } = require("sequelize");

// MySQL is used here specifically for the chat feature (rooms + messages)
// This shows students how to use two different databases in one backend.
const sequelize = new Sequelize(
  process.env.MYSQL_DB,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: "mysql",
    logging: false,
  }
);

const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log("[MySQL] Connected successfully");
    // sync models (creates tables if they don't exist)
    await sequelize.sync();
    console.log("[MySQL] Models synced");
  } catch (err) {
    console.error(`[MySQL] Connection error: ${err.message}`);
  }
};

module.exports = { sequelize, connectMySQL };
