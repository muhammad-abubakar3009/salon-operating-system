const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  try {
    const { name, sku, unit, reorder_threshold } = req.body;

    if (!name || !sku) {
      return res.status(400).json({ error: "Name and SKU are required" });
    }

    const existingProduct = await prisma.product.findUnique({ where: { sku } });
    if (existingProduct) {
      return res.status(409).json({ error: "A product with this SKU already exists" });
    }

    const product = await prisma.product.create({
      data: { name, sku, unit, reorder_threshold },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something Went Wrong" });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    return res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something Went Wrong" });
  }
});

router.post("/:id/adjust", async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);
    const { change_amount, reason } = req.body;

    if (!change_amount || !reason) {
      return res
        .status(400)
        .json({ error: "change_amount and reason are required" });
    }

    if (change_amount === 0) {
      return res.status(400).json({ error: "change_amount cannot be zero" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const newQuantity = product.stock_quantity + change_amount;
    if (newQuantity < 0) {
      return res
        .status(400)
        .json({ error: "This adjustment would take stock below zero" });
    }

    const [adjustment, updatedProduct] = await prisma.$transaction([
      prisma.stockAdjustment.create({
        data: {
          product_id: productId,
          change_amount,
          reason,
          adjusted_by_id: req.user.id,
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { stock_quantity: newQuantity },
      }),
    ]);

    return res.status(201).json({ adjustment, product: updatedProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something Went Wrong" });
  }
});

module.exports = router;
