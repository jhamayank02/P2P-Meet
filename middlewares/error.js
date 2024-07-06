class ErrorHandler extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
    }
}

const TryCatch = (passedFunc) => {
        return async (req, res, next)=>{
        try{   
            await passedFunc(req, res, next);
        }
        catch(err){
            next(err);
        }
    }
}

const ErrorMiddleware = (err, req, res, next)=>{
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    return res.status(err.statusCode).json({
        status: err.statusCode,
        success: false,
        message: err.message
    })
}

module.exports = {
    ErrorHandler,
    TryCatch,
    ErrorMiddleware,
}