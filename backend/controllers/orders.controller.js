import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export const handlePostOrders = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

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
          create: items.map((i) => {
            const product = products.find((p) => p.id === i.productId);
            return {
              productId: i.productId,
              quantity: i.quantity,
              price: product.price,
              cost: product.cost,
            };
          }),
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

export const handleGetAllOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            address: true,
          }
        },
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
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            address: true,
          }
        },
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if the user is the buyer
    let isAuthorized = order.userId === userId;

    // If not the buyer, check if the user is a seller who owns any product in the order
    if (!isAuthorized && req.user.type === "SELLER") {
      const sellerProducts = await prisma.product.findMany({
        where: { sellerId: userId },
        select: { id: true },
      });
      const sellerProductIds = sellerProducts.map((p) => p.id);

      // Check if any item in the order belongs to this seller
      isAuthorized = order.items.some((item) => sellerProductIds.includes(item.productId));
    }

    if (!isAuthorized) {
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
    const { items } = req.body;
    const userId = req.user.id;

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

    // Check if the user is the buyer
    let isAuthorized = order.userId === userId;

    // If not the buyer, check if the user is a seller who owns any product in the order
    if (!isAuthorized && req.user.type === "SELLER") {
      const sellerProducts = await prisma.product.findMany({
        where: { sellerId: userId },
        select: { id: true },
      });
      const sellerProductIds = sellerProducts.map((p) => p.id);

      // Check if any item in the order belongs to this seller
      isAuthorized = order.items.some((item) => sellerProductIds.includes(item.productId));
    }

    if (!isAuthorized) {
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
