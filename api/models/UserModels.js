import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter your name"],
        maxLength: [25, "your name is too long max-length is 25 character"],
        minLenght: [3, "minimum 3 character required"]
    },
    email: {
        type: String,
        required: [true, "please enter your email"],
        unique: true,
        validate: [validator.isEmail, "please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "please enter your password"],
        select: false
    },
    mobile: {
        type: String,
        required: [true, "please enter your mobile number"],
    },
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

// password hashing
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});


// jwt
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// verify password
userSchema.methods.verifyPassword = async function (userEnteredPassword) {
    return await bcrypt.compare(userEnteredPassword.toString(),
        this.password
    )
}

userSchema.methods.generatePasswordResetToken = function () {
    // generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // hash and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // set token expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 min

    return resetToken;
}

export default mongoose.model("User", userSchema);