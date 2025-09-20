import express from "express";
import { PrismaClient } from "../generated/prisma/client.js";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/users.controller.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /user/profile
router.get("/profile", getUserProfile);

// PUT /user/profile
router.put("/profile", updateUserProfile);

export default router;
