import { z } from "zod";

const lessonValidation = {
  generateLesson: z.object({
    grade: z.string().min(1, "Lớp không được để trống"),
    subject: z.string().min(1, "Môn học không được để trống"),
    topic: z.string().min(1, "Chủ đề không được để trống"),
    periods: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      return Number(val);
    }),
    lessonType: z.enum([
      "Giáo án chuẩn (bám sát Bộ GD&ĐT)",
      "Giáo án phương pháp dạy học tích cực",
      "Giáo án tích hợp liên môn",
      "Giáo án STEAM"
    ]).transform(val => {
      switch(val) {
        case "Giáo án chuẩn (bám sát Bộ GD&ĐT)": return "standard";
        case "Giáo án phương pháp dạy học tích cực": return "active";
        case "Giáo án tích hợp liên môn": return "integrated";
        case "Giáo án STEAM": return "steam";
        default: throw new Error("Loại giáo án không hợp lệ");
      }
    }),
    file: z.any().optional()
  }),
};


export default lessonValidation;
