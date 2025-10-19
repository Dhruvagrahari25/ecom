import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "./generated/prisma/client.js";
import usersRoutes from "./routes/users.routes.js"
import authRoutes from "./routes/auth.routes.js"
import orderRoutes from "./routes/orders.routes.js";
import sellerRoutes from "./routes/seller.routes.js"
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middlewares/auth.middlewares.js";
import cors from "cors";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // limit each IP
});




const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(limiter);

// test route
app.get("/", (req, res) => {
  res.send("API running");
});

// Routes
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/orders", orderRoutes);
app.use("/sellers", sellerRoutes);

app.listen(PORT, () => {
  console.log(`Server running on POST http://localhost:${PORT}`);
});