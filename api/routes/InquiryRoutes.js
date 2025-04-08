import express from "express";
import { submitInquiry } from "../controllers/InquiryController.js";

const router = express.Router();

router.post("/inquiry", submitInquiry);

export default router;
