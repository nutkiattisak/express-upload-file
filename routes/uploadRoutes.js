const express = require("express")
const path = require("path")
const { upload, uploadGCS } = require("../utils/fileHelper")
const uploadController = require("../controllers/upload.controller")

const router = express.Router()

router.post("/upload", upload.single("file"), uploadController.handleFileUpload)
router.post("/upload-gcs", uploadGCS.single("file"), uploadController.uploadFileToGCS)

router.get("/uploads/:filename", (req, res) => {
    const filename = req.params.filename
    res.sendFile(path.join(__dirname, "../uploads", filename))
})

router.get("/fileList", uploadController.getFileList)

module.exports = router
