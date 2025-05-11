import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import User from "../models/UserModels.js";
import { sendToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Register user
export const registerUser = handleAsyncError(async (req, res) => {
    const { name, email, password, mobile, avatar } = req.body;

    try {
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
});

// Login user
// export const loginUser = handleAsyncError(async (req, res, next) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return next(new HandleError("Email or password cannot be empty", 400));
//     }

//     const user = await User.findOne({ email }).select("+password");
//     if (!user) {
//         return next(new HandleError("Account doesn't exist", 404));
//     }

//     const isPasswordValid = await user.verifyPassword(password);
//     if (!isPasswordValid) {
//         return next(new HandleError("Invalid email or password", 400));
//     }

//     sendToken(user, 200, res);
// });
export const loginUser = handleAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new HandleError("Email or password cannot be empty", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new HandleError("Invalid email", 404));
    }

    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
        return next(new HandleError("Wrong password", 401));
    }

    sendToken(user, 200, res);
});


// Logout user
export const logoutUser = handleAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});

// Forgot password
export const requestPasswordReset = handleAsyncError(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return next(new HandleError("User not found", 404));
    }

    try {
        const resetToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetPasswordUrl = `https://apekshaclasses452.netlify.app/reset/${resetToken}`;
        // `http://localhost:3000/reset/${resetToken}`;
        const message = `Your password reset token is as follows:\n\n ${resetPasswordUrl} \n\nIf you have not requested this email, please ignore it.`;

        await sendEmail({
            email: user.email,
            subject: "Password Recovery",
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new HandleError("Error while sending email", 500));
    }
});

// Reset password
export const resetPassword = handleAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new HandleError("Reset password token is invalid or expired", 404));
    }

    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return next(new HandleError("Password and confirm password do not match", 400));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res);
});

// Get user details
export const getUserDetails = handleAsyncError(async (req, res, next) => {
    console.log(" Authenticated user:", req.user);
    res.status(200).json({
        success: true,
        user: req.user,
    });
});

// Send code to confirm user before update
export const sendVerificationCode = handleAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) return next(new HandleError("User not found", 404));

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.verificationCode = verificationCode;
    user.verificationCodeExpire = Date.now() + 10 * 60 * 1000; 
    await user.save({ validateBeforeSave: false });

    const message = `Your verification code is: ${verificationCode}`;

    await sendEmail({
        email: user.email,
        subject: "Email Verification Code",
        message,
    });

    res.status(200).json({
        success: true,
        message: `Verification code sent to ${user.email}`,
    });
});

// confirmverification
export const confirmVerificationCode = async (req, res) => {
    try {
        const { verificationCode } = req.body;

        const user = await User.findById(req.user._id);

        if (
            !user ||
            user.verificationCode !== verificationCode ||
            user.verificationCodeExpire < Date.now()
        ) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }

        // Optionally: clear the code after successful verification
        user.verificationCode = undefined;
        user.verificationCodeExpire = undefined;

        await user.save({ validateBeforeSave: false });

        res.status(200).json({ message: "Verification successful" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update user password
export const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        const user = await User.findById(req.user._id).select("+password");

        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Update profile
export const updateProfile = async (req, res) => {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
  
    if (!user) return res.status(404).json({ message: "User not found" });
  
    // Update fields
    user.name = name;
    user.email = email;
  
    const code = crypto.randomInt(100000, 999999).toString();
    user.verificationCode = code;
    user.verificationCodeExpire = Date.now() + 10 * 60 * 1000;
  
    await user.save({ validateBeforeSave: false });
  
    await  sendEmail({
      email: user.email,
      subject: "Email Verification",
      message: `Your verification code is: ${code}`,
    });
  
    res.status(200).json({
      success: true,
      message: "Profile updated. Verification code sent to new email.",
      user,
    });
  };



// Admin - Get all users
export const getAllUsers = handleAsyncError(async (req, res, next) => {
    const users = await User.find();

    if (!users || users.length === 0) {
        return next(new HandleError("No users found", 404));
    }

    res.status(200).json({
        success: true,
        users,
    });
});

// Admin - Get single user
export const getSingleUser = handleAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new HandleError("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user,
    });
});

// Admin - Update user role
export const updateUserRole = handleAsyncError(async (req, res, next) => {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    if (!user) {
        return next(new HandleError("User not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        user,
    });
});

// Admin - Delete user
export const deleteUser = handleAsyncError(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new HandleError("User not found", 400));
    }

    res.status(200).json({
        success: true,
        message: "User deleted successfully",
        user,
    });
});
