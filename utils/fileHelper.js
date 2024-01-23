const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        const fileName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        cb(null, fileName)
    },
})

function getFileNameFromRequest(req) {
    if (req.file) {
        return req.file.filename
    } else {
        // Handle the case when no file is uploaded
        return null
    }
}

const upload = multer({ storage })
const uploadGCS = multer()

module.exports = {
    upload,
    uploadGCS,
    getFileNameFromRequest,
}
