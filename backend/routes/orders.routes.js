import express from "express";
import { PrismaClient } from "../generated/prisma/client.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import {
  handleGetAllOrders,
  handleGetOrder,
  handlePatchOrder,
  handlePostOrders,
} from "../controllers/orders.controller.js";

const router = express.Router();
const prisma = new PrismaClient();

// POST /orders – place a new order
router.post("/", authMiddleware(["PERSONAL", "BUSINESS"]), handlePostOrders);

// GET /orders – list user’s orders
router.get("/", authMiddleware(["PERSONAL", "BUSINESS"]), handleGetAllOrders);

// GET /orders/:id – fetch single order details
router.get("/:id", authMiddleware(["PERSONAL", "BUSINESS"]), handleGetOrder);

// PATCH /orders/:id – update order items (quantities only)
router.patch("/:id", authMiddleware(["PERSONAL", "BUSINESS"]), handlePatchOrder);

export default router;
