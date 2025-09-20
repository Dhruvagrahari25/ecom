import express from "express";
import { PrismaClient } from "../generated/prisma/client.js";
import {
  handleGetAllOrders,
  handleGetOrder,
  handlePatchOrder,
  handlePostOrders,
} from "../controllers/orders.controller.js";

const router = express.Router();
const prisma = new PrismaClient();

// POST /orders – place a new order
router.post("/", handlePostOrders);

// GET /orders – list user’s orders
router.get("/", handleGetAllOrders);

// GET /orders/:id – fetch single order details
router.get("/:id", handleGetOrder);

// PATCH /orders/:id – update order items (quantities only)
router.patch("/:id", handlePatchOrder);

export default router;
