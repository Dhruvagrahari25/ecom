import express from "express";
import { PrismaClient } from "./generated/prisma/client.js";
import usersRoutes from "./routes/users.routes.js"
import authRoutes from "./routes/auth.routes.js"
import orderRoutes from "./routes/orders.routes.js";
import sellerRoutes from "./routes/seller.routes.js"

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("API running");
});

// Routes
app.use("/users", usersRoutes);
app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);
app.use("/sellers", sellerRoutes);

app.listen(PORT, () => {
  console.log(`Server running on POST ${PORT}`);
});