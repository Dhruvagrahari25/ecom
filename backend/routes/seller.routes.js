import express from "express";
import { PrismaClient } from "../generated/prisma/client.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import {
  postSellerItems,
  deleteSellerItems,
  getSellerItems,
  getSellerOrders,
  patchSellerOrders,
} from "../controllers/sellers.controller.js";

const router = express.Router();
const prisma = new PrismaClient();

//POST /sellers/items - Add new item to store
router.post("/items", authMiddleware(["SELLER"]), postSellerItems);

//DELETE /sellers/items/:itemId - Delete product from store
router.delete("/items/:itemId", authMiddleware(["SELLER"]), deleteSellerItems);

//GET /sellers/orders - List seller’s orders (filter by status if provided)
router.get("/orders", authMiddleware(["SELLER"]), getSellerOrders);

//PATCH /sellers/orders/:id - Update order status
router.patch("/orders/:id", authMiddleware(["SELLER"]), patchSellerOrders);

//GET /sellers/items - List all items of a seller
router.get("/items", authMiddleware(["SELLER"]), getSellerItems);

export default router;
