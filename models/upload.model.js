const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const Upload = sequelize.define("uploads", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    file: {
        type: DataTypes.STRING,
        allowNull: false,
    },
})

module.exports = Upload
