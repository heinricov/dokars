-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "image_url" VARCHAR(2048),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pics" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "team" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "silos" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "image_url" VARCHAR(2048),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "silos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "pic" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_receipts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "register_no" VARCHAR(50) NOT NULL,
    "submit_date" TIMESTAMP(3) NOT NULL,
    "silo_id" UUID NOT NULL,
    "pic_id" UUID NOT NULL,
    "vendor_id" UUID,
    "invoice_no" VARCHAR(50),
    "po_no" VARCHAR(50),
    "latest_date" TIMESTAMP(3),
    "note" TEXT,
    "scan_date" TIMESTAMP(3),
    "upload_date" TIMESTAMP(3),
    "is_urgent" BOOLEAN NOT NULL DEFAULT false,
    "is_done" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_receipts_register_no_key" ON "invoice_receipts"("register_no");

-- CreateIndex
CREATE INDEX "invoice_receipts_user_id_idx" ON "invoice_receipts"("user_id");

-- CreateIndex
CREATE INDEX "invoice_receipts_silo_id_idx" ON "invoice_receipts"("silo_id");

-- CreateIndex
CREATE INDEX "invoice_receipts_pic_id_idx" ON "invoice_receipts"("pic_id");

-- CreateIndex
CREATE INDEX "invoice_receipts_vendor_id_idx" ON "invoice_receipts"("vendor_id");

-- AddForeignKey
ALTER TABLE "invoice_receipts" ADD CONSTRAINT "invoice_receipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_receipts" ADD CONSTRAINT "invoice_receipts_silo_id_fkey" FOREIGN KEY ("silo_id") REFERENCES "silos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_receipts" ADD CONSTRAINT "invoice_receipts_pic_id_fkey" FOREIGN KEY ("pic_id") REFERENCES "pics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_receipts" ADD CONSTRAINT "invoice_receipts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
