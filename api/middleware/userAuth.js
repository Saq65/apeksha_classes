import handleAsyncError from "../middleware/handleAsyncError.js";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModels.js";
import HandleError from "../utils/handleError.js";

// Verify user authentication
export const verifyUserAuth = handleAsyncError(async (req, res, next) => {
    const { token } = req.cookies;  


    if (!token) {
        return next(new HandleError("Authentication is missing please login to access this resource", 400));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await UserModel.findById(decodedData.id);
    next();
});

export const protect = async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
  
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  
        req.user = await UserModel.findById(decoded.id).select("-password");
        if (!req.user) {
          return res.status(401).json({ message: "Not authorized" });
        }
  
        next();
      } catch (error) {
        return res.status(401).json({ message: "Not authorized, token failed" });
      }
    } else {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  };
  
  


// Verify user role
export const roleBasedAccess = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new HandleError(`Role: ${req.user.role} is not allowed to access this resource`, 400));
        }
        next();
    };
}