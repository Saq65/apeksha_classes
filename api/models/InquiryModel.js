import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    studentClass: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Inquiry", inquirySchema);
