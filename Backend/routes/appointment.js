const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  try {
    const { client_id, stylist_id, service, appointment_time } = req.body;
    if (!client_id || !stylist_id || !service || !appointment_time) {
      return res.status(400).json({ error: "Invalid Input" });
    }
    const client = await prisma.client.findUnique({ where: { id: client_id } });
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    const stylist = await prisma.user.findUnique({
      where: { id: stylist_id },
    });
    if (!stylist) {
      return res.status(404).json({ error: "Stylist not found" });
    }

    const appointment = await prisma.appointment.create({
      data: { client_id, stylist_id, service, appointment_time },
    });

    return res.status(201).json({
      id: appointment.id,
      client_id: appointment.client_id,
      stylist_id: appointment.stylist_id,
      service: appointment.service,
      appointment_time: appointment.appointment_time,
      status: appointment.status,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something Went Wrong" });
  }
});

router.get("/", async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        client: true,
        stylist: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something Went Wrong" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const appointmentId = parseInt(id);

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const { status, appointment_time, service } = req.body;

    const validStatuses = ["booked", "completed", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status, appointment_time, service },
    });

    return res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something Went Wrong" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { client_id } = req.query;

    const whereClause = client_id ? { client_id: Number(client_id) } : {};

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        client: true,
        stylist: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { appointment_time: "desc" },
    });

    return res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something Went Wrong" });
  }
});
module.exports = router;
