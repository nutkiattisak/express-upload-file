const { Sequelize } = require("sequelize")
require("dotenv").config()

async function connectToDatabase() {
    try {
        await sequelize.authenticate()
        console.log("Connected to MySQL database")
    } catch (err) {
        console.error("Error connecting to MySQL:", err)
    }
}

const sequelize = new Sequelize({
    dialect: "mysql",
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
})

module.exports = { connectToDatabase, sequelize }
