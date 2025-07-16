const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
var path = require("path");

dotenv.config({
  path: path.join(
    process.cwd(),
    `.env${!process.env.NODE_ENV || process.env.NODE_ENV === "development"
      ? ""
      : "." + process.env.NODE_ENV
    }`
  ),
});

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: ", p, "reason:", reason);
  // application specific logging, throwing an error, or other logic here
});

const sequelize = new Sequelize(
  process.env.DB,
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? process.env.USER
    : process.env.USERNAME,
  process.env.PASS,
  {
    host: process.env.HOST,
    // port: process.env.DB_PORT || 3307,
    dialect: "mysql",
  }
);

module.exports = {
  sequelize,
  // Returns Mail Configuration
  mailConfig: {
    pool: false,
    name: "",
    host: process.env.MHOST,
    port: process.env.MPORT,
    secure: false,
    auth: {
      user: process.env.MUSER,
      pass: process.env.MPASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    // use up to 5 parallel connections
    maxConnections: 5,
    // do not send more than 10 messages per connection
    maxMessages: 50,
    // no not send more than 5 messages in a second
    rateLimit: 5,
    // debug: true,
    logger: true,
  },
};