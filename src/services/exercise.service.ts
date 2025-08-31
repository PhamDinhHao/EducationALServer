import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Gọi Gemini để sinh nội dung dựa trên chức năng + prompt
 */
const generateAnswer = async (
  func: string,
  prompt: string,
  imageBase64?: string
) => {
  let prefix = "";
  switch (func) {
    case "method":
      prefix = "Bạn là chuyên gia sư phạm. ";
      break;
    case "concept":
      prefix = "Hãy giải thích chi tiết, dễ hiểu. ";
      break;
    case "quiz":
      prefix = "Soạn các câu hỏi đố vui tư duy logic. ";
      break;
    case "example":
      prefix = "Soạn ví dụ minh họa thực tế. ";
      break;
    case "slide":
      prefix =
        "Soạn nội dung dạng slide trình chiếu, ngắn gọn, từng gạch đầu dòng. ";
      break;
    case "flashcards":
      prefix = "Soạn bộ flashcards (hỏi – đáp ngắn gọn). ";
      break;
    default:
      prefix = "";
  }

  const finalPrompt = `${prefix}\n${prompt}`;

  // Nếu có ảnh => gửi kèm text + ảnh
  let result;
  if (imageBase64) {
    // Xử lý nếu base64 có chứa prefix "data:image/png;base64,"
    const cleanBase64 = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

      result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { text: finalPrompt },
              {
                inlineData: {
                  mimeType: "image/png", 
                  data: imageBase64,
                },
              },
            ],
          },
        ],
      });
      
  } else {
    result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
    });
  }

  const text = result.response.text();
  return text;
};

export default { generateAnswer };
