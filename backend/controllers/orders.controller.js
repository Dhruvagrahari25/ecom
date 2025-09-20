import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export const handlePostOrders = async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ error: "userId and items are required" });
    }

    // validate that products exist & are available
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, available: true },
    });

    if (products.length !== items.length) {
      return res.status(400).json({ error: "Some products are not available" });
    }

    // create order with items
    const order = await prisma.order.create({
      data: {
        userId,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const handleAllGetOrders = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true, // fetch product details for each order item
          },
        },
      },
      orderBy: { placedAt: "desc" }, // latest first
    });

    res.json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const handleGetOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query; // for now, take userId from query

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

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

    // make sure the order belongs to the user
    if (order.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (err) {
    console.error("Error fetching order details:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const handlePatchOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, items } = req.body;

    if (!userId || !items || !Array.isArray(items)) {
      return res
        .status(400)
        .json({ error: "userId and items (array) are required" });
    }

    // Fetch the order with current items
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this order" });
    }

    // Process items
    const updatePromises = items.map(async (item) => {
      const existingItem = order.items.find(
        (orderItem) => orderItem.productId === item.productId
      );

      if (existingItem) {
        if (item.quantity > 0) {
          // Update existing item
          return prisma.orderItem.update({
            where: { id: existingItem.id },
            data: { quantity: item.quantity },
          });
        } else {
          // Remove if quantity = 0
          return prisma.orderItem.delete({
            where: { id: existingItem.id },
          });
        }
      } else {
        if (item.quantity > 0) {
          // Add new product to order
          return prisma.orderItem.create({
            data: {
              orderId: id,
              productId: item.productId,
              quantity: item.quantity,
            },
          });
        }
      }
    });

    await Promise.all(updatePromises);

    // Fetch updated order
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    res.json(updatedOrder);
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
