import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { CURRICULUM } from "../src/lib/curriculum";

const db = new PrismaClient();

async function main() {
  let courses = 0;
  let lessons = 0;

  for (const course of CURRICULUM) {
    const saved = await db.course.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        description: course.description,
        level: course.level,
        isPublished: true,
      },
      create: {
        slug: course.slug,
        title: course.title,
        description: course.description,
        level: course.level,
        isPublished: true,
      },
    });
    courses += 1;

    for (const [index, lesson] of course.lessons.entries()) {
      await db.lesson.upsert({
        where: { courseId_order: { courseId: saved.id, order: index + 1 } },
        update: {
          title: lesson.title,
          summary: lesson.summary,
          durationMin: 60,
          status: "PUBLISHED",
        },
        create: {
          courseId: saved.id,
          order: index + 1,
          title: lesson.title,
          summary: lesson.summary,
          durationMin: 60,
          status: "PUBLISHED",
        },
      });
      lessons += 1;
    }
  }

  const published = await db.lesson.count({ where: { status: "PUBLISHED" } });
  console.log(`Curriculum seeded: ${courses} courses, ${lessons} lessons. Published: ${published}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
