import prisma from '@/client'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

export const getAllLessons = async () => {
  return prisma.lesson.findMany({
    include: { course: true },
    orderBy: [{ courseId: 'asc' }, { order: 'asc' }]
  })
}

export const getLessonsByCourse = async (courseId: number) => {
  return prisma.lesson.findMany({
    where: { courseId },
    include: { course: true },
    orderBy: { order: 'asc' }
  })
}

export const getLessonById = async (id: number) => {
  return prisma.lesson.findUnique({
    where: { id },
    include: { course: true }
  })
}

export const createLesson = async (input: { title: string; description: string; duration: number; src: string; order: number; courseId: number }) => {
  return prisma.lesson.create({ data: input })
}

export const updateLesson = async (
  id: number,
  input: Partial<{
    title: string
    description: string
    duration: number
    src: string
    order: number
  }>
) => {
  return prisma.lesson.update({ where: { id }, data: input })
}

export const deleteLesson = async (id: number) => {
  return prisma.$transaction(async (tx) => {
    // 1. Delete all lesson progress
    await tx.lessonProgress.deleteMany({
      where: { lessonId: id }
    })

    // 2. Delete all comments for this lesson
    await tx.comment.deleteMany({
      where: { lessonId: id }
    })

    // 3. Finally delete the lesson
    return tx.lesson.delete({
      where: { id }
    })
  })
}

// Hàm gốc gọi Gemini để sinh giáo án
const generateLesson = async (fileContent: string | undefined, grade: string, subject: string, topic: string) => {
  // Ghép prompt động, chỉ thêm tài liệu nếu có file
  const prompt = `
Bạn là một giáo viên ${subject}, nhiều năm kinh nghiệm, đang giảng dạy ${grade}. Hãy soạn kế hoạch bài dạy, ${topic} lớp ${grade} theo đúng chường trình giáo dục phổ thông 2018, đồng thời bám sát nội dung ${subject} ${grade} – Bộ sách${fileContent}. theo đúng cấu trúc sau, tương tự giáo án mẫu trong file:

# Yêu cầu chung về định dạng:
Khổ giấy: A4
Lề: trái 2 cm, phải 1.5 cm, trên 2 cm, dưới 2 cm
Font chữ: Times New Roman, cỡ chữ 13
Khoảng cách dòng: 1.0
Khoảng cách giữa các đoạn: 6 pt
**Không sử dụng dấu gạch ngang (---, *, ___) để phân cách
Toàn bộ gọn gàng liền mạch, chỉ phân cách bằng tiêu đề
# Cấu trúc mỗi bài dạy:
KẾ HOẠCH BÀI DẠY (Lưu ý căn giữa)
Trường: …………… (Lưu ý căn giữa)
Tổ: ……………….. (Lưu ý căn giữa)
Giáo viên: ……………… (Lưu ý căn giữa)
TÊN BÀI DẠY: [Tên bài] (Lưu ý căn giữa)
Môn: [môn]; Lớp: [lop] (Lưu ý căn giữa)
Thời lượng: [số tiết] (Lưu ý căn giữa)
I. Mục tiêu
1. Kiến thức
2. Năng lực:
2.1. Năng lực chung
2.2. Năng lực Toán học/vật lý /hóa/sinh/ (tùy môn)
2.3. Năng lực số (theo Thông tư 02/2025/TT-BGDĐT)
3. Phẩm chất
II. Thiết bị dạy học và học liệu
Giáo viên
Học sinh
III. Tiến trình dạy học
Hoạt động 1: Khởi động
a) Mục tiêu
b) Nội dung
c) Sản phẩm
Tổ chức thực hiện: Bảng 2 cột (Hoạt động GV-HS / Dự kiến sản phẩm)
Cột 1: Hoạt động của GV-HS – chia thành 4 bước như sau:
Bước 1. Giáo viên giao nhiệm vụ
Mô tả chi tiết 2–3 nhiệm vụ cụ thể, rõ ràng
Mỗi nhiệm vụ xuống dòng mới, có dấu gạch đầu dòng “-”
Bước 2. Học sinh thực hiện nhiệm vụ
Mô tả hành động của học sinh (làm việc cá nhân/nhóm, thảo luận, ghi chép, thực hành…)
Mỗi ý xuống dòng, có dấu gạch đầu dòng
Bước 3. Giáo viên tổ chức báo cáo và thảo luận
Mô tả cách GV cho các nhóm/cá nhân trình bày, đặt câu hỏi, phản biện, hỗ trợ nhận xét
Có gạch đầu dòng cho từng hành động
Bước 4. Kết luận
GV tổng hợp, chốt kiến thức, dẫn dắt vào nội dung mới
Mỗi ý có gạch đầu dòng
Cột 2: DỰ KIẾN SẢN PHẨM
Mô tả rõ sản phẩm học sinh tạo ra sau từng bước 1, bước 2, bước 3, bước 4 ở cột 1 (ví dụ: ghi chú cá nhân, bản trình bày, chương trình chạy được, phiếu thảo luận…)
Nhận sản phẩm tương ứng với từng bước ở cột bên trái, liệt kê theo dòng có gạch đầu dòng
Hoạt động 2: Hình thành kiến thức mới
(Chia 2–4 tiểu hoạt động nếu cần)
Mục tiêu
Nội dung
Sản phẩm
Tổ chức thực hiện: Bảng 2 cột (Hoạt động GV-HS / Dự kiến sản phẩm)
Cột 1: Hoạt động của GV-HS – chia thành 4 bước như sau:
Bước 1. Giáo viên giao nhiệm vụ
Mô tả chi tiết 2–3 nhiệm vụ cụ thể, rõ ràng
Mỗi nhiệm vụ xuống dòng mới, có dấu gạch đầu dòng “-”
Bước 2. Học sinh thực hiện nhiệm vụ
Mô tả hành động của học sinh (làm việc cá nhân/nhóm, thảo luận, ghi chép, thực hành…)
Mỗi ý xuống dòng, có dấu gạch đầu dòng
Bước 3. Giáo viên tổ chức báo cáo và thảo luận
Mô tả cách GV cho các nhóm/cá nhân trình bày, đặt câu hỏi, phản biện, hỗ trợ nhận xét
Có gạch đầu dòng cho từng hành động
Bước 4. Kết luận
GV tổng hợp, chốt kiến thức, dẫn dắt vào nội dung mới
Mỗi ý có gạch đầu dòng
Cột 2: DỰ KIẾN SẢN PHẨM
Mô tả rõ sản phẩm học sinh tạo ra sau từng bước 1, bước 2, bước 3, bước 4 ở cột 1 (ví dụ: ghi chú cá nhân, bản trình bày, chương trình chạy được, phiếu thảo luận…)
Nhận sản phẩm tương ứng với từng bước ở cột bên trái, liệt kê theo dòng có gạch đầu dòng
Hoạt động 3: Luyện tập
Mục tiêu: Rõ ràng, cụ thể, liên quan đến năng lực cần rèn
Nội dung: Bài tập, câu hỏi, tình huống thực hành phù hợp với đối tượng học sinh
Sản phẩm: Bài làm, chương trình chạy được, ghi chép…
Tổ chức thực hiện: 4 bước (giao nhiệm vụ, thực hiện, báo cáo, kết luận)
Bước 1. Chuyển giao nhiệm vụ
Giao bài tập hoặc yêu cầu thực hành
Phân nhóm (nếu cần)
Hướng dẫn cách thức thực hiện
Bước 2. Thực hiện nhiệm vụ
Học sinh làm việc cá nhân hoặc nhóm
GV quan sát, hỗ trợ, gợi ý
Bước 3. Báo cáo, thảo luận
Các nhóm/cá nhân trình bày kết quả
Học sinh nhận xét, phản biện
Bước 4. Kết luận, nhận định
GV nhận xét, sửa lỗi, chốt kiến thức
Tuyên dương, định hướng phát triển
Hoạt động 4: Vận dụng
Mục tiêu: Vận dụng kiến thức vào tình huống thực tiễn, sáng tạo, giải quyết vấn đề
Nội dung: Nhiệm vụ mở rộng, gần gũi với đời sống (ví dụ: viết chương trình chúc mừng, xử lý dữ liệu đơn giản…)
Sản phẩm: Chương trình, bài thuyết trình, sản phẩm số…
Tổ chức thực hiện: Trình bày dạng văn bản thường, gồm 4 bước (giống Hoạt động 3, có gạch đầu dòng)
PHIẾU HỌC TẬP
Trình bày dạng văn bản thường (không bảng)
Liệt kê tất cả các nhiệm vụ học sinh cần thực hiện
Phân công nhiệm vụ cụ thể cho các nhóm (2–4 nhóm, phù hợp với sĩ số và nội dung bài)
Ví dụ: Nhóm 1 làm phần A, nhóm 2 làm phần B…
Có thể kèm theo câu hỏi, sơ đồ, bảng trống để học sinh điền
CÂU HỎI TRẮC NGHIỆM
Trình bày dạng văn bản thường (không bảng)
Gồm 5 câu hỏi dạng trắc nghiệm nhiều lựa chọn hoặc đúng/sai
Nội dung bám sát kiến thức bài học
Các đáp án được liệt kê ở cuối phần (ví dụ: Đáp án: 1.C, 2.B, 3.A, 4.D, 5.C)
# Yêu cầu thực hiện:
Mỗi bài dạy trình bày liền mạch, không ngắt giữa chừng.
Tích hợp phương pháp dạy học tích cực: khởi động bằng tình huống, hoạt động nhóm, thực hành, vận dụng.
Tuân thủ tinh thần Công văn 5512/BGDĐT.
Bắt đầu soạn giáo án ngay.

`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    const clean = text.match(/\{[\s\S]*\}/)
    return clean ? JSON.parse(clean[0]) : { raw: text }
  } catch {
    return { raw: text }
  }
}

// Các loại giáo án
export const generateStandardLesson = (fileContent: string | undefined, grade: string, subject: string, topic: string) => generateLesson(fileContent, grade, subject, topic)

export const generateActiveLearningLesson = (fileContent: string | undefined, grade: string, subject: string, topic: string) => generateLesson(fileContent, grade, subject, topic)

export const generateIntegratedLesson = (fileContent: string | undefined, grade: string, subject: string, topic: string) => generateLesson(fileContent, grade, subject, topic)

export const generateSTEAMLesson = (fileContent: string | undefined, grade: string, subject: string, topic: string) => generateLesson(fileContent, grade, subject, topic)
