import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "./generated/prisma/client.js";
import usersRoutes from "./routes/users.routes.js"
import authRoutes from "./routes/auth.routes.js"
import orderRoutes from "./routes/orders.routes.js";
import sellerRoutes from "./routes/seller.routes.js"
import subscriptionRoutes from "./routes/subscriptions.routes.js"
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middlewares/auth.middlewares.js";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cron from "node-cron";
import { runSubscriptionCron } from "./controllers/subscriptions.controller.js";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // limit each IP
});

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // your React dev server
    credentials: true, // allow cookies to be sent
  })
);
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
app.use("/subscriptions", subscriptionRoutes);

// Cron job: check subscriptions every minute
cron.schedule("* * * * *", () => {
  runSubscriptionCron();
});

app.listen(PORT, () => {
  console.log(`Server running on PORT http://localhost:${PORT}`);
});