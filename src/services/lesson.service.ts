import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Hàm gốc gọi Gemini để sinh giáo án
const generateLesson = async (
  fileContent: string | undefined,
  grade: string,
  subject: string,
  topic: string,
  periods: number | undefined,
  lessonType: string
) => {
  // Ghép prompt động, chỉ thêm tài liệu nếu có file
  const prompt = `
Bạn là một giáo viên giỏi. Hãy soạn giáo án theo chuẩn 5512.
${fileContent ? `\nĐây là tài liệu kiến thức:\n${fileContent}\n` : ""}
- Loại giáo án: ${lessonType}
- Lớp: ${grade}
- Môn: ${subject}
- Chủ đề: ${topic}
- Số tiết: ${periods}

Xuất JSON theo format:
{
  "title": "Tên bài học",
  "grade": "${grade}",
  "subject": "${subject}",
  "topic": "${topic}",
  "lessonType": "${lessonType}",
  "periods": ${periods},
  "objectives": ["Mục tiêu 1", "Mục tiêu 2"],
  "activities": [
    { "step": "Khởi động", "description": "Hoạt động khởi động..." },
    { "step": "Hình thành kiến thức", "description": "..." },
    { "step": "Luyện tập", "description": "..." },
    { "step": "Vận dụng", "description": "..." }
  ],
  "assessment": "Hình thức đánh giá..."
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const clean = text.match(/\{[\s\S]*\}/);
    return clean ? JSON.parse(clean[0]) : { raw: text };
  } catch {
    return { raw: text };
  }
};

// Các loại giáo án
export const generateStandardLesson = (
  fileContent: string | undefined,
  grade: string,
  subject: string,
  topic: string,
  periods: number | undefined
) =>
  generateLesson(
    fileContent,
    grade,
    subject,
    topic,
    periods,
    "Giáo án chuẩn (bám sát Bộ GD&ĐT)"
  );

export const generateActiveLearningLesson = (
  fileContent: string | undefined,
  grade: string,
  subject: string,
  topic: string,
  periods: number | undefined
) =>
  generateLesson(
    fileContent,
    grade,
    subject,
    topic,
    periods,
    "Giáo án phương pháp dạy học tích cực"
  );

export const generateIntegratedLesson = (
  fileContent: string | undefined,
  grade: string,
  subject: string,
  topic: string,
  periods: number | undefined
) =>
  generateLesson(
    fileContent,
    grade,
    subject,
    topic,
    periods,
    "Giáo án tích hợp liên môn"
  );

export const generateSTEAMLesson = (
  fileContent: string | undefined,
  grade: string,
  subject: string,
  topic: string,
  periods: number | undefined
) =>
  generateLesson(fileContent, grade, subject, topic, periods, "Giáo án STEAM");

export default {
  generateStandardLesson,
  generateActiveLearningLesson,
  generateIntegratedLesson,
  generateSTEAMLesson,
};
