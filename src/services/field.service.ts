// src/modules/Course/services/fieldService.ts
import prisma from '@/client'

export const createField = async (courseId: number, name: string, value: string) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error('Course not found');

  return prisma.field.create({
    data: { courseId: course.id, name, value },
  });
};

export const getFields = async (courseId: number) => {
  return prisma.field.findMany({ where: { courseId } });
};

export const updateField = async (fieldId: number, name: string, value: string) => {
  return prisma.field.update({
    where: { id: fieldId },
    data: { name, value },
  });
};

export const deleteField = async (fieldId: number) => {
  return prisma.field.delete({ where: { id: fieldId } });
};
