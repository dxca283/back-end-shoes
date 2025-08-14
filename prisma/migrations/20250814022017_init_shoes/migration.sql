-- CreateTable
CREATE TABLE "Shoe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "size" REAL NOT NULL,
    "color" TEXT,
    "price" REAL NOT NULL,
    "stock" INTEGER NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "sku" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ShoeImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "shoeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShoeImage_shoeId_fkey" FOREIGN KEY ("shoeId") REFERENCES "Shoe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Shoe_sku_key" ON "Shoe"("sku");

-- CreateIndex
CREATE INDEX "Shoe_brand_idx" ON "Shoe"("brand");

-- CreateIndex
CREATE INDEX "Shoe_category_idx" ON "Shoe"("category");

-- CreateIndex
CREATE INDEX "Shoe_price_idx" ON "Shoe"("price");
