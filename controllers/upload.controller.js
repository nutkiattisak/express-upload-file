const Upload = require("../models/upload.model")
const fileHelper = require("../utils/fileHelper")
const apiHelper = require("../helpers/apiHelper")
const { Storage } = require("@google-cloud/storage")

const projectId = process.env.GCP_PROJECT_ID
const keyFilename = process.env.GCP_KEY_FILE_NAME

const storage = new Storage({
    projectId,
    keyFilename,
})

const bucketName = process.env.GCP_BUCKET_NAME
const bucket = storage.bucket(bucketName)

async function saveFilenameToDatabase(fileName) {
    try {
        await Upload.create({ file: fileName })
    } catch (err) {
        console.error("Error inserting filename into MySQL:", err)
        throw err
    }
}

async function getFileListFromDatabase(req, page = 1, perPage = 10) {
    try {
        const offset = (page - 1) * perPage
        const uploads = await Upload.findAndCountAll({
            offset,
            limit: perPage,
        })

        const fileData = uploads.rows.map((upload) => {
            const { file, ...rest } = upload.toJSON()

            const isUrl = file.startsWith("http://") || file.startsWith("https://")

            return {
                ...rest,
                ...(isUrl ? { file } : { fileUrl: `${req.protocol}://${req.get("host")}/uploads/${file}` }),
            }
        })

        return {
            count: uploads.count,
            totalPages: Math.ceil(uploads.count / perPage),
            currentPage: page,
            files: fileData,
        }
    } catch (error) {
        console.error("Error getting file list from database:", error)
        throw error
    }
}

async function getFileList(req, res) {
    const page = parseInt(req.query.page) || 1
    const perPage = parseInt(req.query.perPage) || 10

    try {
        const fileData = await getFileListFromDatabase(req, page, perPage)
        res.json(apiHelper.successResponse(fileData, "File list retrieved successfully"))
    } catch (error) {
        console.error("Error getting file list:", error)
        res.status(500).json(apiHelper.errorResponse("Internal Server Error"))
    }
}

async function handleFileUpload(req, res) {
    try {
        const fileName = fileHelper.getFileNameFromRequest(req)
        await saveFilenameToDatabase(fileName)

        if (!fileName) {
            throw new Error("No file uploaded or file URL provided.")
        }

        const responseMessage = req.file ? `File uploaded. File URL: ${req.file.filename}` : `File URL provided`

        res.json(apiHelper.successResponse(responseMessage))
    } catch (error) {
        console.error("Error handling file upload:", error)
        res.status(500).json(apiHelper.errorResponse("Internal Server Error"))
    }
}

async function uploadFileToGCS(req, res) {
    try {
        const fileBuffer = req.file.buffer
        const originalname = req.file.originalname

        const timestamp = Date.now()
        const modifiedName = `${timestamp}_${originalname}`

        const blob = bucket.file(modifiedName)
        const blobStream = blob.createWriteStream({ resumable: false })

        blobStream.on("error", (err) => {
            console.error("Error uploading file:", err)
            res.status(500).json(apiHelper.errorResponse("Error uploading file"))
        })

        blobStream.on("finish", async () => {
            try {
                await bucket.file(modifiedName).makePublic()
                const fileName = `https://storage.googleapis.com/${bucket.name}/${blob.name}`

                await saveFilenameToDatabase(fileName)

                res.json(apiHelper.successResponse("File uploaded successfully"))
            } catch (err) {
                res.status(500).json(apiHelper.errorResponse("Error making file public"))
            }
        })

        blobStream.end(fileBuffer)
    } catch (err) {
        console.error("Error processing file upload:", err)
        res.status(500).json(apiHelper.errorResponse("Error processing file upload"))
    }
}

module.exports = {
    handleFileUpload,
    getFileList,
    uploadFileToGCS,
}
