import express from "express";
import { PrismaClient } from "../generated/prisma/client.js";
import {
  deleteSellerItems,
  getSellerItems,
  getSellerOrders,
  patchSellerOrders,
} from "../controllers/sellers.controller.js";

const router = express.Router();
const prisma = new PrismaClient();

//POST /sellers/items - Add new item to store
router.post("/items", postSellerItems);

//DELETE /sellers/items/:itemId - Delete product from store
router.delete("/items/:itemId", deleteSellerItems);

//GET /sellers/orders - List seller’s orders (filter by status if provided)
router.get("/orders", getSellerOrders);

//PATCH /sellers/orders/:id - Update order status
router.patch("/orders/:id", patchSellerOrders);

//GET /sellers/items - List all items of a seller
router.get("/items", getSellerItems);

export default router;
