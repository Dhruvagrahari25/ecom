import express from "express";
import { PrismaClient } from "../generated/prisma/client.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /user/profile
router.get("/profile", async (req, res) => {
  try {
    // For demo, let's assume we get `userId` from query or middleware (auth)
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /user/profile
router.put("/profile", async (req, res) => {
  try {
    const { userId, name, phone, email, type, address } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(type && { type }),
        ...(address && { address }),
      },
    });

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;