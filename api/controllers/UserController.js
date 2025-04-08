import handleAsyncError from "../middleware/handleAsyncError.js";
import User from "../models/UserModels.js";
import HandleError from "../middleware/handleAsyncError.js";
import { sendToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

// register user
export const registerUser = handleAsyncError(async (req, res) => {
    try {
        const { name, email, password, mobile, avatar } = req.body;

        const user = await User.create({
            name,
            email,
            password,
            mobile,
            avatar,
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user,
        });

    } catch (error) {
        // Handle MongoDB duplicate key error
        if (error.code === 11000 && error.keyPattern?.email) {
            return res.status(400).json({
                success: false,
                message: "Your account already exists. Please log in.",
            });
        }

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
);



// login user
export const loginUser = handleAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new HandleError("Email or password cannot be empty", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new HandleError("Your account doesn't exist. Please sign up.", 404));
    }

    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
        return next(new HandleError("Invalid email or password", 401));
    }

    sendToken(user, 200, res);
});


// logout user
export const logoutUser = handleAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    })
    res.status(200).json({
        success: true,
        message: "logged out successfully"
    })
})

// Forget password
export const requestPasswordReset = handleAsyncError(async (req, res, next) => {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
        return next(new HandleError("User not found", 404));
    }

    let resetToken;
    try {
        resetToken = user.generatePasswordResetToken(); // ✅ just assign, don't redeclare
        await user.save({ validateBeforeSave: false });
    } catch (error) {
        console.log("Reset Token Error:", error); // optional for debugging
        return next(new HandleError("Error while generating reset token", 400));
    }

    const resetPasswordUrl = `http://localhost:8000/reset/${resetToken}`;
    const message = `Your password reset token is as follow:\n\n ${resetPasswordUrl} \n\n If you 
    have not requested this email, please ignore it.`
    try {
        // send email functionality
        await sendEmail({
            email: user.email,
            subject: "Password Recovery",
            message: message
        })
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new HandleError("Error while sending email", 500));
    }
});

// Reset password
export const resetPassword = handleAsyncError(async (req, res, next) => {

    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await UserModel.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) {
        return next(new HandleError("Reset password token is invalid or expired", 404));
    }

    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return next(new HandleError("Password and confirm password do not match", 404));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, res);
})

// user details
export const getUserDetails = handleAsyncError(async (req, res, next) => {
    const user = await UserModel.findById(req.user.id);
    res.status(200).json({
        success: true,
        user
    })

})

// update user password
export const updatePassword = handleAsyncError(async (req, res, next) => {
    const user = await UserModel.findById(req.user.id).select("+password");
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const checkPasswordMatch = await user.verifyPassword(oldPassword);
    if (!checkPasswordMatch) {
        return next(new HandleError("Old password is incorrect", 400));
    }

    if (newPassword !== confirmPassword) {
        return next(new HandleError("New password and confirm password do not match", 400));
    }

    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
})

// profile update
export const updateProfile = handleAsyncError(async (req, res, next) => {
    const { name, email } = req.body;
    const user = await UserModel.findByIdAndUpdate(req.user.id, {
        name,
        email
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user
    })
})


// admin get all users
export const getAllUsers = handleAsyncError(async (req, res, next) => {
    const users = await UserModel.find();
    if (!users || users.length == 0) {
        return next(new HandleError("No users found", 404))
    }
    res.status(200).json({
        success: true,
        users,
    });
})

// admin get single user
export const getSingleUser = handleAsyncError(async (req, res, next) => {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
        return next(new HandleError("User not found", 404))
    }
    res.status(200).json({
        success: true,
        user
    })
})

// admin update user role
export const updateUserRole = handleAsyncError(async (req, res, next) => {
    const { role } = req.body;
    const user = await UserModel.findByIdAndUpdate(req.params.id, {
        role
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    if (!user) {
        return next(new HandleError("User not found", 404))
    }
    res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        user
    })
})

// admin delete userprofile
export const deleteUser = handleAsyncError(async (req, res, next) => {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) {
        return next(new HandleError("User not found", 400))
    }
    res.status(200).json({
        success: true,
        message: "User deleted successfully",
        user
    })
})
