import { Request, Response } from "express";
import * as commentService from "../services/comment.service";


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


export const postComment = async (req: Request, res: Response) => {
  const lessonId = parseInt(req.params.lessonId);
  const { author, content, parentId } = req.body;

  if (!author || !content) {
    return res.status(400).json({ message: "Thiếu thông tin bình luận" });
  }

  try {
    let comment;
    if (parentId) {
      comment = await commentService.createReply(lessonId, parentId, author, content);
    } else {
      comment = await commentService.createComment(lessonId, author, content);
    }

    res.status(201).json(comment);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


export const getAllComments = async (req: Request, res: Response) => {
  try {
    const comments = await commentService.getAllComments();
    res.json(comments);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


export const getCommentCount = async (req: Request, res: Response) => {
  try {
    const count = await commentService.getCommentCount();
    res.json({ count });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};