import express from "express";
import { PrismaClient } from "../generated/prisma/client.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/users.controller.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /user/profile
router.get("/profile", authMiddleware(["PERSONAL", "BUSINESS", "SELLER"]), getUserProfile);

// PUT /user/profile
router.put("/profile", authMiddleware(["PERSONAL", "BUSINESS", "SELLER"]), updateUserProfile);

export default router;
