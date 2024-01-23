const { connectToDatabase } = require("./database")
const app = require("express")()
const uploadRoutes = require("../routes/uploadRoutes")
const port = process.env.PORT || 3000

async function startServer() {
    await connectToDatabase()
    app.use("/api/", uploadRoutes)

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`)
    })
}

module.exports = {
    startServer,
}
