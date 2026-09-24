-- CreateTable
CREATE TABLE "Formula" (
    "id" SERIAL NOT NULL,
    "appointment_id" INTEGER NOT NULL,
    "formula" TEXT NOT NULL,
    "developer" TEXT,
    "processing_time" INTEGER,
    "starting_condition" TEXT,
    "desired_result" TEXT,
    "actual_result" TEXT,
    "before_photo_url" TEXT,
    "after_photo_url" TEXT,
    "stylist_notes" TEXT,
    "client_feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Formula_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Formula_appointment_id_key" ON "Formula"("appointment_id");

-- AddForeignKey
ALTER TABLE "Formula" ADD CONSTRAINT "Formula_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
