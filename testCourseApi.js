// testCourseApi.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testPrisma() {
  try {
    // 1️⃣ Tạo khóa học mới
    const newCourse = await prisma.course.create({
      data: {
        title: "NodeJS Express",
        description: "Khóa học NodeJS Express cơ bản",
        img: "https://example.com/node.png",
        url: "https://example.com/course/nodejs"
      }
    })
    console.log("✅ Created:", newCourse)

    const courseId = newCourse.id

    // 2️⃣ Lấy tất cả khóa học
    const allCourses = await prisma.course.findMany()
    console.log("📚 All courses:", allCourses)

    // 3️⃣ Lấy khóa học theo ID
    const singleCourse = await prisma.course.findUnique({
      where: { id: courseId }
    })
    console.log("🔎 Single course:", singleCourse)

    // 4️⃣ Cập nhật khóa học
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: "NodeJS Express Updated",
        description: "Khóa học NodeJS Express nâng cao",
        img: "https://example.com/node-advanced.png"
      }
    })
    console.log("✏️ Updated:", updatedCourse)

    // 5️⃣ Xóa khóa học
    await prisma.course.delete({ where: { id: courseId } })
    console.log("🗑️ Deleted course", courseId)

  } catch (err) {
    console.error("❌ Error:", err.message)
  } finally {
    await prisma.$disconnect()
  }
}

testPrisma()
