// Information Response (100-199)
// Successful response (200-299)
// Redirection response (300-399)
// Client Error response (400-499)
// Server Error reponse (500-599)

class apiResponse{
    constructor(statusCode, data, message='Success'){
        this.statusCode =statusCode
        this.data = data
        this.message = message
        this.sucess = statusCode < 400
    }
}

export default apiResponse