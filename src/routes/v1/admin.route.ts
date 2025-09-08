// src/routes/admin.route.ts
import { Router } from "express";
import { addCourseColumn } from "@/services/admin.service";
import { isAdminMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

/**
 * POST /admin/courses/add-field
 * body: { fieldName: string, sampleValue: any }
 */
router.post("/courses/add-field", isAdminMiddleware, async (req, res) => {
  try {
    const { fieldName, sampleValue } = req.body;
    const newField = await addCourseColumn(fieldName, sampleValue);
    res.json({ message: `Field '${fieldName}' added successfully`, field: newField });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
