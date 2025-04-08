import handleAsyncError from "../middleware/handleAsyncError.js";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModels.js";

// Verify user authentication
export const verifyUserAuth = handleAsyncError(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return next(new HandleError("Authentication is missing please login to access this resource", 400));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await UserModel.findById(decodedData.id);
    next();
}); 

// Verify user role
export const roleBasedAccess = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new HandleError(`Role: ${req.user.role} is not allowed to access this resource`, 400));
        }
        next();
    };
}