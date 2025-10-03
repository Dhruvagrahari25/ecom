import express from "express";
import { PrismaClient } from "../generated/prisma/client.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  handleLogin,
  handleSignUp,
  // handleVerify,
} from "../controllers/auth.controller.js";

const router = express.Router();
const prisma = new PrismaClient();

//POST /auth/signup
router.post("/signup", handleSignUp);

//POST /auth/login (password or OTP)
router.post("/login", handleLogin);

// POST /auth/verify (OTP verification)
// router.post("/verify", handleVerify);

export default router;
