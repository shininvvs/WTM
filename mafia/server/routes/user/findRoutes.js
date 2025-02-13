import express from "express";
import { findID, requestResetPassword, resetPassword } from "../../controllers/user/findController.js";

const router = express.Router();

router.post("/find-id", findID);
router.post("/request-reset-password", requestResetPassword);
router.post("/reset-password", resetPassword);

export default router;
