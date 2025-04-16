import express from "express";
import { getInquirry, submitInquiry } from "../controllers/InquiryController.js";

const router = express.Router();

router.post("/inquiry", submitInquiry);
router.get("/getmsg",getInquirry);

export default router;
