import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export const postSellerItems = async (req, res) => {
  try {
    const { sellerId, name, description, price, unit } = req.body;

    if (!sellerId || !name || !price || !unit) {
      return res
        .status(400)
        .json({ error: "sellerId, name, price, unit are required" });
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
};

export const deleteSellerItems = async (req, res) => {
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
};

export const getSellerOrders = async (req, res) => {
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
};

export const patchSellerOrders = async (req, res) => {
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
};

export const getSellerItems = async (req, res) => {
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
};
