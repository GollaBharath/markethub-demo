import express from "express";
import { adminLogin } from "../controllers/adminAuthController";

const router = express.Router();

router.post("/admin", adminLogin);

export default router;
