-- CreateTable
CREATE TABLE "ProjectProduct" (
    "id" SERIAL NOT NULL,
    "id_project" INTEGER NOT NULL,
    "id_product" TEXT NOT NULL,

    CONSTRAINT "ProjectProduct_pkey" PRIMARY KEY ("id")
);

-- Migrate existing one-to-many project/product data into the pivot table.
INSERT INTO "ProjectProduct" ("id_project", "id_product")
SELECT "id", "id_product"
FROM "Project"
WHERE "id_product" IS NOT NULL;

-- Remove the old direct project -> product relation.
ALTER TABLE "Project" DROP CONSTRAINT IF EXISTS "Project_id_product_fkey";
ALTER TABLE "Project" DROP COLUMN "id_product";

-- CreateIndex
CREATE UNIQUE INDEX "ProjectProduct_id_project_id_product_key" ON "ProjectProduct"("id_project", "id_product");

-- AddForeignKey
ALTER TABLE "ProjectProduct" ADD CONSTRAINT "ProjectProduct_id_project_fkey" FOREIGN KEY ("id_project") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectProduct" ADD CONSTRAINT "ProjectProduct_id_product_fkey" FOREIGN KEY ("id_product") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
