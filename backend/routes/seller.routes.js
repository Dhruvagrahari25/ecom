import express from "express";
import { PrismaClient } from "../generated/prisma/client.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import {
  postSellerItems,
  deleteSellerItems,
  getSellerItems,
  getSellerItemById,
  getSellerOrders,
  patchSellerOrders,
  patchSellerItems,
  getSellerDashboard,
} from "../controllers/sellers.controller.js";

const router = express.Router();
const prisma = new PrismaClient();

//GET /sellers/dashboard - Get seller dashboard metrics
router.get("/dashboard", authMiddleware(["SELLER"]), getSellerDashboard);

//GET /sellers/items - List all items of a seller
router.get("/items", authMiddleware(["SELLER", "PERSONAL", "BUSINESS"]), getSellerItems);

//GET /sellers/items/:id - Get a specific item
router.get("/items/:id", authMiddleware(["SELLER", "PERSONAL", "BUSINESS"]), getSellerItemById);

//POST /sellers/items - Add new item to store
router.post("/items", authMiddleware(["SELLER"]), postSellerItems);

//PATCH /sellers/items/:id - Update item in store
router.patch("/items/:id", authMiddleware(["SELLER"]), patchSellerItems);

//DELETE /sellers/items/:itemId - Delete product from store
router.delete("/items/:itemId", authMiddleware(["SELLER"]), deleteSellerItems);

//GET /sellers/orders - List seller’s orders (filter by status if provided)
router.get("/orders", authMiddleware(["SELLER"]), getSellerOrders);

//PATCH /sellers/orders/:id - Update order status
router.patch("/orders/:id", authMiddleware(["SELLER"]), patchSellerOrders);


export default router;
