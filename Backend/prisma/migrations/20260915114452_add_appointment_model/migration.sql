-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "service" TEXT NOT NULL,
    "appointment_time" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'booked',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "client_id" INTEGER NOT NULL,
    "stylist_id" INTEGER NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
