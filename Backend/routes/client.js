const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const requireOwner = require("../middleware/requireOwner");

const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something Went Wrong" });
  }
});

router.post("/", requireOwner, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Name, email, password, and role are required" });
    }

    const validRoles = ["owner", "stylist", "receptionist"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password_hash: hashedPassword, role },
    });

    return res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something Went Wrong" });
  }
});

module.exports = router;
