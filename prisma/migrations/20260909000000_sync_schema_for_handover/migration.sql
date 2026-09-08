-- User email verification
ALTER TABLE "User"
ADD COLUMN "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "verification_token" TEXT,
ADD COLUMN "verification_expires" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_verification_token_key"
ON "User"("verification_token");

-- Soft delete flags
ALTER TABLE "Brand"
ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Category"
ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AC type master data
CREATE TABLE "AcType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "AcType_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AcType_name_key" ON "AcType"("name");

-- Move product category from the old pivot table to Product.
-- If a product has multiple old categories, keep the smallest category ID.
ALTER TABLE "Product"
ADD COLUMN "id_category" INTEGER,
ADD COLUMN "id_ac_type" INTEGER,
ADD COLUMN "freon_type" TEXT,
ADD COLUMN "model_code" TEXT,
ADD COLUMN "series_name" TEXT,
ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Product" AS product
SET "id_category" = category."id_category"
FROM (
    SELECT "id_product", MIN("id_category") AS "id_category"
    FROM "ProductCategory"
    GROUP BY "id_product"
) AS category
WHERE product."id" = category."id_product";

ALTER TABLE "Product" DROP COLUMN "type";
DROP TABLE "ProductCategory";

ALTER TABLE "Product"
ADD CONSTRAINT "Product_id_category_fkey"
FOREIGN KEY ("id_category") REFERENCES "Category"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Product"
ADD CONSTRAINT "Product_id_ac_type_fkey"
FOREIGN KEY ("id_ac_type") REFERENCES "AcType"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
