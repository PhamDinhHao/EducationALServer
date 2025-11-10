import { Request, Response } from 'express'
import * as courseService from '../services/course.service'
import uploadService from '@/services/upload.service'
import ApiError from '@/utils/ApiError'
import httpStatus from 'http-status'
import catchAsync from '@/utils/catchAsync'

export const listCourses = async (_req: Request, res: Response) => {
  try {
    const courses = await courseService.listCourses()
    res.json(courses)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const getCourseById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    const course = await courseService.getCourseById(id)
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khoá học' })
    res.json(course)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const createCourse = async (req: Request, res: Response) => {
  const { title, description, img, url, teacher, students, duration, courseTypeId } = req.body
  if (!title || !description || !teacher || !courseTypeId) {
    return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' })
  }
  try {
    const created = await courseService.createCourse({
      title,
      description,
      img: img ?? null,
      url: url ?? null,
      teacher,
      students: students ? Number(students) : undefined,
      duration: duration ?? null,
      courseTypeId: Number(courseTypeId)
    })
    res.status(201).json(created)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const updateCourse = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    const updated = await courseService.updateCourse(id, req.body)
    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteCourse = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ message: 'ID không hợp lệ' })
  try {
    await courseService.deleteCourse(id)
    res.status(204).send()
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const getTopEnrolledCourses = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
    const data = await courseService.getTopEnrolledCourses(limit);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCoursesByCategoryId = async (req: Request, res: Response) => {
  const categoryId = parseInt(req.params.categoryId);
  if (isNaN(categoryId)) return res.status(400).json({ message: 'Category ID không hợp lệ' });
  try {
    const courses = await courseService.getCoursesByCategoryId(categoryId);
    res.json(courses);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const queryCourses = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortType = (req.query.sortType as 'asc' | 'desc') || 'desc';
    const search = req.query.search as string | undefined;
    const courseTypeId = req.query.course_type_id 
      ? parseInt(req.query.course_type_id as string) 
      : req.query.courseTypeId 
        ? parseInt(req.query.courseTypeId as string) 
        : undefined;

    const result = await courseService.queryCourses({
      page,
      limit,
      sortBy,
      sortType,
      search,
      courseTypeId
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const uploadCourseImage = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file provided');
  }

  const imageUrl = await uploadService.uploadImage('courses', file.path);
  
  if (!imageUrl) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload image');
  }

  res.status(200).json({
    success: true,
    data: { url: imageUrl },
    message: 'Image uploaded successfully'
  });
});


