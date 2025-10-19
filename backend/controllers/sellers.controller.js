import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export const postSellerItems = async (req, res) => {
  try {
    const { name, description, price, unit } = req.body;
    const sellerId = req.user.id;

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

    // Find the product by itemId
    const product = await prisma.product.findUnique({
      where: { id: itemId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if the logged-in seller is the owner of the product
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own products" });
    }

    // Proceed with deletion if authorized
    await prisma.product.delete({
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
    const { status } = req.query;
    const sellerId = req.user.id;

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
    const { id } = req.params; // order ID
    const { status } = req.body; // new status

    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    // Find the order to check its associated products
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if the order contains products belonging to the logged-in seller
    const isSellerOrder = order.items.some(item => item.product.sellerId === req.user.id);
    if (!isSellerOrder) {
      return res.status(403).json({ error: "You can only update orders related to your products" });
    }

    // Proceed with updating the order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    res.json(updatedOrder);
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSellerItems = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const items = await prisma.product.findMany({
      where: { sellerId },
    });

    res.json(items);
  } catch (err) {
    console.error("Error fetching seller items:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
