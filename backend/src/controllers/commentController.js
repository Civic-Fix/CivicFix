import commentService from '../services/commentService.js';

export const getComments = async (req, res) => {
  try {
    const { issue_id } = req.query;

    if (!issue_id) {
      return res.status(400).json({ error: 'issue_id query parameter is required' });
    }

    const comments = await commentService.getCommentsByIssueId(issue_id);
    res.json({ comments });
  } catch (error) {
    console.error('CommentController.getComments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const createComment = async (req, res) => {
  try {
    const { issue_id, description } = req.body;
    const created_by = req.user.id; // From auth middleware

    if (!issue_id || !description) {
      return res.status(400).json({ error: 'issue_id and description are required' });
    }

    if (description.trim().length === 0) {
      return res.status(400).json({ error: 'Comment description cannot be empty' });
    }

    const comment = await commentService.createComment(issue_id, description.trim(), created_by);
    res.status(201).json({ comment });
  } catch (error) {
    console.error('CommentController.createComment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const userId = req.user.id;

    if (!description) {
      return res.status(400).json({ error: 'description is required' });
    }

    if (description.trim().length === 0) {
      return res.status(400).json({ error: 'Comment description cannot be empty' });
    }

    const comment = await commentService.updateComment(id, description.trim(), userId);
    res.json({ comment });
  } catch (error) {
    console.error('CommentController.updateComment error:', error);
    if (error.message.includes('not found or not authorized')) {
      return res.status(404).json({ error: 'Comment not found or not authorized' });
    }
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await commentService.deleteComment(id, userId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('CommentController.deleteComment error:', error);
    if (error.message.includes('not found or not authorized')) {
      return res.status(404).json({ error: 'Comment not found or not authorized' });
    }
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

export const voteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote_type } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.id;

    if (!vote_type || !['upvote', 'downvote'].includes(vote_type)) {
      return res.status(400).json({ error: 'vote_type must be "upvote" or "downvote"' });
    }

    const comment = await commentService.voteComment(id, vote_type, userId);
    res.json({ comment });
  } catch (error) {
    console.error('CommentController.voteComment error:', error);
    res.status(500).json({ error: 'Failed to vote on comment' });
  }
};