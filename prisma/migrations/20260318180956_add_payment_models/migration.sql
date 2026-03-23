-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('created', 'pending', 'confirmed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('mercadopago', 'cash');
