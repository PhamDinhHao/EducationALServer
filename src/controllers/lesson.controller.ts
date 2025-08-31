import { Request, Response } from "express";
import lessonService from "@/services/lesson.service";
import fs from "fs";

const generateLesson = async (req: Request, res: Response) => {
  try {
    const { grade, subject, topic, periods, lessonType } = req.body;
    const file = req.file; // file upload từ multer

    // Nếu có file thì đọc nội dung, không thì để undefined
    let fileContent: string | undefined = undefined;
    if (file) {
      try {
        fileContent = fs.readFileSync(file.path, "utf-8");
      } catch (err) {
        console.error("Không đọc được file:", err);
      }
    }

    let lessonPlan;
    switch (lessonType) {
      case "standard":
        lessonPlan = await lessonService.generateStandardLesson(fileContent, grade, subject, topic, Number(periods));
        break;
      case "active":
        lessonPlan = await lessonService.generateActiveLearningLesson(fileContent, grade, subject, topic, Number(periods));
        break;
      case "integrated":
        lessonPlan = await lessonService.generateIntegratedLesson(fileContent, grade, subject, topic, Number(periods));
        break;
      case "steam":
        lessonPlan = await lessonService.generateSTEAMLesson(fileContent, grade, subject, topic, Number(periods));
        break;
      default:
        return res.status(400).json({ message: "Loại giáo án không hợp lệ" });
    }

    res.json({ data: lessonPlan });
  } catch (error: any) {
    console.error("Error generating lesson:", error);
    res.status(500).json({ message: "Lỗi khi tạo giáo án", error: error.message });
  }
};

export default { generateLesson };
