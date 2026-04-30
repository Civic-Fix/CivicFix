import express from 'express';
import { getComments, createComment, updateComment, deleteComment, voteComment } from '../controllers/commentController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All comment routes require authentication
router.use(requireAuth);

// GET /api/comments?issue_id=<uuid> - Get comments for an issue
router.get('/', getComments);

// POST /api/comments - Create a new comment
router.post('/', createComment);

// PUT /api/comments/:id - Update a comment
router.put('/:id', updateComment);

// DELETE /api/comments/:id - Delete a comment
router.delete('/:id', deleteComment);

// POST /api/comments/:id/vote - Vote on a comment
router.post('/:id/vote', voteComment);

export default router;