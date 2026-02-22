import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export const postSellerItems = async (req, res) => {
  try {
    const { name, description, price, cost, unit } = req.body;
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
        cost: cost || 0,
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
      orderBy: { placedAt: "desc" },
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

export const getSellerItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const patchSellerItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, cost, unit, available } = req.body;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ error: "You can only update your own products" });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price }),
        ...(cost !== undefined && { cost }),
        ...(unit && { unit }),
        ...(available !== undefined && { available }),
      },
    });

    res.json(updatedProduct);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSellerItems = async (req, res) => {
  try {
    // If the user is a seller, they might want to see only their items.
    // If they are a buyer, they should see all available items.
    const userType = req.user.type;
    const sellerId = req.user.id;

    let items;
    if (userType === "SELLER") {
      items = await prisma.product.findMany({
        where: { sellerId },
      });
    } else {
      items = await prisma.product.findMany();
    }

    res.json(items);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all orders that contain items from this seller
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              sellerId,
            },
          },
        },
      },
      include: {
        items: {
          where: {
            product: {
              sellerId,
            },
          },
          include: {
            product: true,
          },
        },
      },
    });

    let totalMonthlyOrders = 0;
    let totalMonthlyOrderValue = 0;
    let totalProfitsMade = 0;
    let totalRevenue = 0;
    let totalOrderValueAllTime = 0;
    let totalOrdersAllTime = orders.length;

    const itemStats = {};

    orders.forEach((order) => {
      const isCurrentMonth = order.placedAt >= startOfMonth;
      if (isCurrentMonth) {
        totalMonthlyOrders++;
      }

      let orderValue = 0;
      let orderCost = 0;

      order.items.forEach((item) => {
        // Use historical price/cost if available, otherwise fallback to current product price/cost
        const price = item.price || item.product.price;
        const cost = item.cost || item.product.cost || 0;
        const quantity = item.quantity;

        const itemRevenue = price * quantity;
        const itemCost = cost * quantity;

        orderValue += itemRevenue;
        orderCost += itemCost;

        totalRevenue += itemRevenue;
        totalProfitsMade += (itemRevenue - itemCost);

        if (isCurrentMonth) {
          totalMonthlyOrderValue += itemRevenue;
        }

        // Track item popularity
        if (!itemStats[item.productId]) {
          itemStats[item.productId] = {
            id: item.productId,
            name: item.product.name,
            quantity: 0,
          };
        }
        itemStats[item.productId].quantity += quantity;
      });

      totalOrderValueAllTime += orderValue;
    });

    const avgProfitPercentage = totalRevenue > 0 ? (totalProfitsMade / totalRevenue) * 100 : 0;
    const avgOrderValue = totalOrdersAllTime > 0 ? totalOrderValueAllTime / totalOrdersAllTime : 0;

    const sortedItems = Object.values(itemStats).sort((a, b) => b.quantity - a.quantity);
    const mostOrderedItem = sortedItems.length > 0 ? sortedItems[0] : null;
    const leastOrderedItem = sortedItems.length > 0 ? sortedItems[sortedItems.length - 1] : null;

    res.json({
      totalMonthlyOrders,
      totalMonthlyOrderValue,
      totalProfitsMade,
      avgProfitPercentage,
      avgOrderValue,
      mostOrderedItem,
      leastOrderedItem,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
