import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [25, "Your name is too long (max length is 25 characters)"],
        minLength: [3, "Minimum 3 characters required"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        select: false
    },
    mobile: {
        type: String,
        required: [false, "Please enter a valid 10-digit mobile number"],
        validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v);
            },
            message: "Please enter a valid 10-digit mobile number",
        },
    }
    ,
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    verificationCode: String,
    verificationCodeExpire: Date,

    role: {
        type: String,
        default: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

userSchema.methods.verifyPassword = async function (userEnteredPassword) {
    return await bcrypt.compare(userEnteredPassword.toString(), this.password);
};

userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    return resetToken;
};

userSchema.methods.isPasswordResetTokenExpired = function () {
    return Date.now() > this.resetPasswordExpire;
};

export default mongoose.model("User", userSchema);
