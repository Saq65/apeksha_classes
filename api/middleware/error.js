import HandleError from "../middleware/handleAsyncError.js";

export default (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "internal server error";

   if(err.name === "CastError"){
    const message = `this resource is invalid ${err.path}`;
    err =  HandleError(message,404)
   }

    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })
}