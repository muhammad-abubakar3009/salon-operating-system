const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  try {
    const {
      appointment_id,
      formula,
      developer,
      processing_time,
      starting_condition,
      desired_result,
      actual_result,
      before_photo_url,
      after_photo_url,
      stylist_notes,
      client_feedback,
    } = req.body;
    if (!appointment_id || !formula) {
      return res.status(400).json({ error: "Invalid Input" });
    }
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointment_id },
    });
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    const existingFormula = await prisma.formula.findUnique({
      where: { appointment_id },
    });
    if (existingFormula) {
      return res
        .status(409)
        .json({ error: "A formula already exists for this appointment" });
    }
    const newformula = await prisma.formula.create({
      data: {
        appointment_id,
        formula,
        developer,
        processing_time,
        starting_condition,
        desired_result,
        actual_result,
        before_photo_url,
        after_photo_url,
        stylist_notes,
        client_feedback,
      },
    });

    return res.status(201).json({
      id: newformula.id,
      formula: newformula.formula,
      developer: newformula.developer,
      processing_time: newformula.processing_time,
      starting_condition: newformula.starting_condition,
      desired_result: newformula.desired_result,
      actual_result: newformula.actual_result,
      before_photo_url: newformula.before_photo_url,
      after_photo_url: newformula.after_photo_url,
      stylist_notes: newformula.stylist_notes,
      client_feedback: newformula.client_feedback,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something Went Wrong" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { client_id } = req.query;

    const whereClause = client_id
      ? { appointment: { client_id: Number(client_id) } }
      : {};

    const formulas = await prisma.formula.findMany({
      where: whereClause,
      include: {
        appointment: {
          include: {
            client: true,
            stylist: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json(formulas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something Went Wrong" });
  }
});

module.exports = router;
