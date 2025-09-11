// src/services/admin.service.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function addCourseColumn(fieldName: string, sampleValue: any) {
  // Xác định kiểu dữ liệu SQL tự động
  let sqlType: string;

  if (typeof sampleValue === "string") {
    sqlType = "VARCHAR(255)";
  } else if (typeof sampleValue === "number") {
    sqlType = "INT";
  } else if (typeof sampleValue === "boolean") {
    sqlType = "BOOLEAN";
  } else if (sampleValue instanceof Date || !isNaN(Date.parse(sampleValue))) {
    sqlType = "TIMESTAMP";
  } else {
    throw new Error("Unsupported value type");
  }

  // Thực hiện ALTER TABLE
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Course"
    ADD COLUMN "${fieldName}" ${sqlType};
  `);

  return { fieldName, sqlType };
}
