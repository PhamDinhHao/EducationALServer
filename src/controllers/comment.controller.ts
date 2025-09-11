import { Request, Response } from "express";
import * as commentService from "../services/comment.service";

/**
 * Lấy comment cha + con cho 1 lesson
 */
export const getComments = async (req: Request, res: Response) => {
  const lessonId = parseInt(req.params.lessonId);
  if (isNaN(lessonId)) return res.status(400).json({ message: "ID không hợp lệ" });

  try {
    const comments = await commentService.getCommentsByLesson(lessonId);
    res.json(comments);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Tạo comment cha hoặc reply (2 cấp)
 * Nếu req.body.parentId có giá trị → là reply
 */
export const postComment = async (req: Request, res: Response) => {
  const lessonId = parseInt(req.params.lessonId);
  const { author, content, parentId } = req.body;

  if (!author || !content) {
    return res.status(400).json({ message: "Thiếu thông tin bình luận" });
  }

  try {
    let comment;
    if (parentId) {
      // tạo reply
      comment = await commentService.createReply(lessonId, parentId, author, content);
    } else {
      // tạo comment cha
      comment = await commentService.createComment(lessonId, author, content);
    }

    res.status(201).json(comment);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
