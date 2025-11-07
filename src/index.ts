import { Server } from 'http'
import app from './app'
import prisma from './client'
import config from '@configs/config'
import logger from '@configs/logger'
import { initializeDefaultAdmin } from '@utils/initAdmin'

let server: Server

const PORT = process.env.PORT || config.port || 3000
const blogs = [
  {
    userId: 1,
    title: 'Giới thiệu về Prisma ORM trong Node.js',
    content:
      '# Prisma ORM là gì?\n\nPrisma là một ORM mạnh mẽ giúp làm việc với cơ sở dữ liệu trong Node.js dễ dàng hơn.\n\n## Ưu điểm\n- Tự động sinh client TypeScript.\n- Hỗ trợ nhiều loại cơ sở dữ liệu: MySQL, PostgreSQL, MongoDB...\n- Có thể chạy migration dễ dàng.\n\n## Cài đặt\n```bash\nnpm install prisma --save-dev\nnpx prisma init\n```\n\n## Ví dụ query\n```ts\nconst allUsers = await prisma.user.findMany();\n```\n\n> Prisma giúp bạn code ít hơn nhưng hiệu quả hơn 🚀',
    image: 'https://images.unsplash.com/photo-1605902711622-cfb43c4437d1',
    createdAt: '2025-10-15T09:00:00Z',
    tags: ['Prisma', 'ORM', 'Node.js']
  },
  {
    userId: 2,
    title: 'Cách viết nội dung Markdown chuyên nghiệp',
    content:
      "# Viết Markdown hiệu quả\n\nMarkdown giúp bạn viết **nội dung dễ đọc** và **dễ hiển thị**.\n\n## Các thành phần cơ bản\n1. **Tiêu đề** dùng `#`\n2. *In nghiêng* và **in đậm**\n3. Liệt kê:\n   - Gạch đầu dòng\n   - Số thứ tự\n\n## Code block\n```js\nconsole.log('Hello Markdown!');\n```\n\n## Kết luận\n> Hãy sử dụng Markdown cho blog hoặc tài liệu kỹ thuật để dễ bảo trì hơn 💡",
    image: 'https://images.unsplash.com/photo-1551334787-21e6bd3ab135',
    createdAt: '2025-09-21T15:30:00Z',
    tags: ['Markdown', 'Chuyên nghiệp', 'Hiệu quả']
  },
  {
    userId: 1,
    title: 'Xây dựng Blog với Next.js và Prisma',
    content:
      '# Tạo Blog hiện đại với Next.js + Prisma\n\n## Bước 1: Tạo project\n```bash\nnpx create-next-app blog-app\n```\n\n## Bước 2: Cấu hình Prisma\n```bash\nnpx prisma init\n```\n\n## Bước 3: Kết nối database\nSửa file `.env`:\n```\nDATABASE_URL="mysql://root:password@localhost:3306/blogdb"\n```\n\n## Bước 4: Tạo model Blog\n```prisma\nmodel Blog {\n  id        Int      @id @default(autoincrement())\n  title     String\n  content   String\n}\n```\n\n## Bước 5: Hiển thị danh sách bài viết\n```ts\nconst blogs = await prisma.blog.findMany();\n```\n\n> 💡 Kết hợp với TailwindCSS để có giao diện đẹp và responsive!',
    image: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29',
    createdAt: '2025-11-01T11:10:00Z',
    tags: ['Prisma', 'ORM', 'Node.js']
  },
  {
    userId: 2,
    title: 'Top 5 mẹo tối ưu hiệu năng React',
    content:
      "# Tối ưu React App\n\nReact rất mạnh mẽ nhưng dễ bị **re-render không cần thiết**.\n\n## Mẹo 1: Dùng `React.memo`\n```ts\nexport default React.memo(MyComponent);\n```\n\n## Mẹo 2: Dùng `useCallback` cho function props\n```ts\nconst handleClick = useCallback(() => {...}, []);\n```\n\n## Mẹo 3: Tránh tạo object inline\n```ts\n// Sai\n<MyComp style={{ color: 'red' }} />\n\n// Đúng\nconst style = { color: 'red' };\n<MyComp style={style} />\n```\n\n> ⚡ Giữ cho component nhỏ, logic tách biệt, và tránh props thay đổi không cần thiết.",
    image: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e',
    createdAt: '2025-08-29T08:45:00Z'
  },
  {
    userId: 2,
    title: 'Hướng dẫn triển khai ứng dụng Node.js lên Vercel',
    content:
      '# Deploy Node.js lên Vercel\n\n## Chuẩn bị\n- Tài khoản [Vercel](https://vercel.com)\n- Project Node.js hoặc Next.js\n\n## Các bước\n1. Cài đặt CLI\n```bash\nnpm i -g vercel\n```\n2. Đăng nhập và deploy\n```bash\nvercel login\nvercel\n```\n3. Theo dõi log triển khai trong dashboard.\n\n## Lưu ý\n- Vercel tự động nhận diện framework.\n- Có thể thêm file `vercel.json` để tùy chỉnh.\n\n> 🚀 Triển khai ứng dụng chỉ trong vài giây!',
    image: 'https://images.unsplash.com/photo-1526378722484-cc6c8e0df4db',
    createdAt: '2025-10-05T19:25:00Z'
  }
]
// blogs.forEach(async (blog) => {
//   await prisma.blog.create({ data: { ...blog, tags: { connectOrCreate: blog.tags?.map((t) => ({ where: { name: t }, create: { name: t } })) } } })
// })

prisma.$connect().then(async () => {
  logger.info('Connected to SQL Database')

  // Initialize default admin user if no admin exists
  await initializeDefaultAdmin()

  server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
  })
})

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed')
      process.exit(1)
    })
  } else {
    process.exit(1)
  }
}

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error)
  exitHandler()
}

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)

process.on('SIGTERM', () => {
  logger.info('SIGTERM received')
  if (server) {
    server.close()
  }
})
