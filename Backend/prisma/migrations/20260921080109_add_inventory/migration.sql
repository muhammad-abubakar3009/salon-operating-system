-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "reorder_threshold" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockAdjustment" (
    "id" SERIAL NOT NULL,
    "change_amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" INTEGER NOT NULL,
    "adjusted_by_id" INTEGER NOT NULL,

    CONSTRAINT "StockAdjustment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_adjusted_by_id_fkey" FOREIGN KEY ("adjusted_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
