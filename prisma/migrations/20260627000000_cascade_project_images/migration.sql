-- DropForeignKey
ALTER TABLE "ProjectImages" DROP CONSTRAINT IF EXISTS "ProjectImages_id_project_fkey";

-- AddForeignKey
ALTER TABLE "ProjectImages" ADD CONSTRAINT "ProjectImages_id_project_fkey" FOREIGN KEY ("id_project") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
