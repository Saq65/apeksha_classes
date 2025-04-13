import express from "express";
import { confirmVerificationCode, deleteUser, getAllUsers, getSingleUser, getUserDetails, loginUser, logoutUser, registerUser, requestPasswordReset, resetPassword, sendVerificationCode, updatePassword, updateProfile, updateUserRole } from "../controllers/UserController.js";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";
const router = express.Router();

router.post('/verify/send-code', verifyUserAuth, sendVerificationCode);
router.post('/verify-code', verifyUserAuth, confirmVerificationCode);

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/forgot/password").post(requestPasswordReset);
router.route("/reset/:token").put(resetPassword);
router.route("/profile").get(verifyUserAuth, getUserDetails);
router.route("/update-password").put(verifyUserAuth, updatePassword);
router.route("/profile-update").put(verifyUserAuth, updateProfile);
router.route("/admin/users").get(verifyUserAuth,roleBasedAccess('admin'), getAllUsers);
router.route("/admin/users/:id").get(verifyUserAuth, roleBasedAccess('admin'), getSingleUser)
.put(verifyUserAuth, roleBasedAccess('admin'), updateUserRole)
.delete(verifyUserAuth, roleBasedAccess('admin'), deleteUser);

export default router;