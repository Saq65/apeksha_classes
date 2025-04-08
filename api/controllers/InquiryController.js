// controllers/inquiryController.js
import Inquiry from "../models/InquiryModel.js";
import handleAsyncError from "../middleware/handleAsyncError.js";

export const submitInquiry = handleAsyncError(async (req, res, next) => {
    const { name, email, contact, studentClass, message } = req.body;

    if (!name || !email || !contact || !studentClass || !message) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const inquiry = await Inquiry.create({
        name,
        email,
        contact,
        studentClass,
        message,
    });

    res.status(200).json({
        success: true,
        message: "Inquiry submitted successfully",
        inquiry
    });
});
