const express = require("express");
const dotenv = require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const clientRoutes = require("./routes/client");
const appointmentRoutes = require("./routes/appointment");
const userRoutes = require("./routes/users");
const authMiddleware = require("./middleware/auth");
const app = express();
const prisma = new PrismaClient();
const formulaRoutes = require("./routes/formulas");
const crypto = require("crypto");
const sendResetEmail = require("./utils/mailer");
const productRoutes = require("./routes/products");

app.use(cors());
app.use(express.json());
app.use("/clients", authMiddleware, clientRoutes);
app.use("/appointments", authMiddleware, appointmentRoutes);
app.use("/users", authMiddleware, userRoutes);
app.use("/formulas", authMiddleware, formulaRoutes);
app.use("/products", authMiddleware, productRoutes);

app.get("/protected-test", authMiddleware, (req, res) => {
  console.log(req.user);
  res.json({ message: "You made it in", user: req.user });
});

app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password_hash: hashPassword },
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email & Password is Required" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "User Not Found!" });
    }
    const matchPass = await bcrypt.compare(password, user.password_hash);
    if (!matchPass) {
      return res.status(401).json({ error: "Invalid Email or Password" });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});
app.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.passwordResetToken.upsert({
        where: { user_id: user.id },
        update: { token, expires_at: expiresAt },
        create: { user_id: user.id, token, expires_at: expiresAt },
      });

      await sendResetEmail(user.email, token);
    }

    return res.status(200).json({
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});
app.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return res
        .status(404)
        .json({ error: "Invalid or already-used reset link" });
    }

    if (resetRecord.expires_at < new Date()) {
      return res.status(400).json({ error: "This reset link has expired" });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await prisma.user.update({
      where: { id: resetRecord.user_id },
      data: { password_hash: hashedPassword },
    });

    await prisma.passwordResetToken.delete({
      where: { token },
    });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});
app.listen(3000, () => console.log("Server running on port 3000"));
