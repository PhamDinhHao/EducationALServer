// src/modules/Course/controllers/fieldController.ts
import { Request, Response } from 'express';
import * as fieldService from '../services/field.service';

export const createField = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { name, value } = req.body;
    const field = await fieldService.createField(Number(courseId), name, value);
    res.status(201).json(field);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getFields = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const fields = await fieldService.getFields(Number(courseId));
    res.json(fields);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateField = async (req: Request, res: Response) => {
  try {
    const { fieldId } = req.params;
    const { name, value } = req.body;
    const field = await fieldService.updateField(Number(fieldId), name, value);
    res.json(field);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteField = async (req: Request, res: Response) => {
  try {
    const { fieldId } = req.params;
    await fieldService.deleteField(Number(fieldId));
    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
