-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('Car', 'Motorcycle', 'CNG');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phone_number" TEXT NOT NULL,
    "email" TEXT,
    "notificationToken" TEXT,
    "ratings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRides" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "vehicle_type" "VehicleType" NOT NULL,
    "registration_number" TEXT NOT NULL,
    "registration_date" TEXT NOT NULL,
    "driving_license" TEXT NOT NULL,
    "vehicle_color" TEXT,
    "rate" TEXT NOT NULL,
    "notificationToken" TEXT,
    "ratings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEarning" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRides" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingRides" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cancelRides" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rides" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "charge" DOUBLE PRECISION NOT NULL,
    "currentLocationName" TEXT NOT NULL,
    "destinationLocationName" TEXT NOT NULL,
    "distance" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_number_key" ON "user"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "driver_phone_number_key" ON "driver"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "driver_email_key" ON "driver"("email");

-- CreateIndex
CREATE UNIQUE INDEX "driver_registration_number_key" ON "driver"("registration_number");

-- AddForeignKey
ALTER TABLE "rides" ADD CONSTRAINT "rides_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rides" ADD CONSTRAINT "rides_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
