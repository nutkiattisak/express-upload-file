function successResponse(data, message = "Success") {
    return {
        success: true,
        message,
        data,
    }
}

function errorResponse(message = "Internal Server Error", statusCode = 500) {
    return {
        success: false,
        message,
        statusCode,
    }
}

module.exports = {
    successResponse,
    errorResponse,
}
