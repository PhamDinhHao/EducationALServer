// src/modules/Course/routes/fieldRouter.ts
import { Router } from 'express';
import * as fieldController from '../../controllers/field.controller';

const router = Router();

// POST /v1/courses/:courseId/fields
router.post('/:courseId/fields', fieldController.createField);

// GET /v1/courses/:courseId/fields
router.get('/:courseId/fields', fieldController.getFields);

// PUT /v1/courses/:courseId/fields/:fieldId
router.put('/:courseId/fields/:fieldId', fieldController.updateField);

// DELETE /v1/courses/:courseId/fields/:fieldId
router.delete('/:courseId/fields/:fieldId', fieldController.deleteField);

export default router;
