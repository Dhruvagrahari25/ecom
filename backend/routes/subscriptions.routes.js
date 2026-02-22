import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import {
    handleGetSubscriptions,
    handleGetSubscription,
    handleCreateSubscription,
    handleUpdateSubscription,
    handleDeleteSubscription,
} from "../controllers/subscriptions.controller.js";

const router = express.Router();
const BUYER_ROLES = ["PERSONAL", "BUSINESS"];

// Only buyers can manage subscriptions
router.get("/", authMiddleware(BUYER_ROLES), handleGetSubscriptions);
router.get("/:id", authMiddleware(BUYER_ROLES), handleGetSubscription);
router.post("/", authMiddleware(BUYER_ROLES), handleCreateSubscription);
router.patch("/:id", authMiddleware(BUYER_ROLES), handleUpdateSubscription);
router.delete("/:id", authMiddleware(BUYER_ROLES), handleDeleteSubscription);

export default router;
