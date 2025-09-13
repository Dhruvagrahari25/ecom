import express from "express";
import { PrismaClient } from "../generated/prisma/client.js";

const router = express.Router();
const prisma = new PrismaClient();

//POST /sellers/items - Add new item to store
router.post("/items", async (req, res) => {
  try {
    const { sellerId, name, description, price, unit } = req.body;

    if (!sellerId || !name || !price || !unit) {
      return res.status(400).json({ error: "sellerId, name, price, unit are required" });
    }

    // Verify seller exists and is of type SELLER
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
    });

    if (!seller || seller.type !== "SELLER") {
      return res.status(403).json({ error: "Invalid seller" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        unit,
        sellerId,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//DELETE /sellers/items/:itemId - Delete product from store
router.delete("/items/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;

    const product = await prisma.product.delete({
      where: { id: itemId },
    });

    res.json({ message: "Product deleted successfully", product });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//GET /sellers/orders - List seller’s orders (filter by status if provided)
router.get("/orders", async (req, res) => {
  try {
    const { sellerId, status } = req.query;

    if (!sellerId) {
      return res.status(400).json({ error: "sellerId is required" });
    }

    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              sellerId,
            },
          },
        },
        ...(status && { status }),
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    res.json(orders);
  } catch (err) {
    console.error("Error fetching seller orders:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//PATCH /sellers/orders/:id - Update order status
router.patch("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    res.json(order);
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//GET /sellers/items - List all items of a seller
router.get("/items", async (req, res) => {
  try {
    const { sellerId } = req.query;

    if (!sellerId) {
      return res.status(400).json({ error: "sellerId is required" });
    }

    const items = await prisma.product.findMany({
      where: { sellerId },
    });

    res.json(items);
  } catch (err) {
    console.error("Error fetching seller items:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;