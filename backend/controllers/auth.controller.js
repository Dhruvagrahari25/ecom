import { PrismaClient } from "../generated/prisma/client.js";
import { generateToken } from "../utils/jwt.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// export const handleSignUp = async (req, res) => {
//   try {
//     const { name, phone, email, type, password } = req.body;

//     if (!name || !phone || !type || !password) {
//       return res
//         .status(400)
//         .json({ error: "Name, phone, type, and password are required" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await prisma.user.create({
//       data: { name, phone, email, type, password: hashedPassword },
//     });

//     res.status(201).json({ message: "Signup successful", user });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Signup failed" });
//   }
// };

// export const handleLogin = async (req, res) => {
//   try {
//     const { phone, password } = req.body;

//     if (!phone) {
//       return res.status(400).json({ error: "Phone is required" });
//     }

//     const user = await prisma.user.findUnique({ where: { phone } });
//     if (!user) return res.status(404).json({ error: "User not found" });

//     // If password provided → password login
//     if (password) {
//       const valid = await bcrypt.compare(password, user.password);
//       if (!valid) return res.status(401).json({ error: "Invalid password" });

//       return res.json({ message: "Login successful (password)", user });
//     }

//     // Otherwise → OTP login
//     const otp = crypto.randomInt(100000, 999999).toString();
//     await prisma.user.update({
//       where: { phone },
//       data: { otp },
//     });

//     // In real app: send OTP via SMS/Email here
//     console.log(`OTP for ${phone}: ${otp}`);

//     res.json({ message: "OTP sent to phone" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Login failed" });
//   }
// };

// export const handleVerify = async (req, res) => {
//   try {
//     const { phone, otp } = req.body;

//     if (!phone || !otp) {
//       return res.status(400).json({ error: "Phone and OTP required" });
//     }

//     const user = await prisma.user.findUnique({ where: { phone } });
//     if (!user || user.otp !== otp) {
//       return res.status(401).json({ error: "Invalid OTP" });
//     }

//     // Clear OTP after verification
//     await prisma.user.update({
//       where: { phone },
//       data: { otp: null },
//     });

//     res.json({ message: "OTP verified", user });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Verification failed" });
//   }
// };




// ------------------- SIGNUP -------------------



export const handleSignUp = async (req, res) => {
  try {
    const { name, phone, email, type, password } = req.body;

    if (!name || !phone || !type || !password) {
      return res
        .status(400)
        .json({ error: "Name, phone, type, and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, phone, email, type, password: hashedPassword },
    });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ message: "Signup successful", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
};

// ------------------- LOGIN -------------------
export const handleLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Phone & Password is required" });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // password login
    if (password) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: "Invalid password" });

      const token = generateToken(user);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ message: "Login successful (password)", user });
    }

    // OTP login flow (you can later add token here after verify)
    return res.json({ message: "Please provide password or use OTP login" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};
