import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

class CommentService {
  // Get all comments for an issue
  async getCommentsByIssueId(issueId) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          description,
          vote,
          created_at,
          created_by,
          created_by_user:users!comments_created_by_fkey (
            id,
            name,
            email
          )
        `)
        .eq('issue_id', issueId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch comments: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('CommentService.getCommentsByIssueId error:', error);
      throw error;
    }
  }

  // Create a new comment
  async createComment(issueId, description, createdBy) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          issue_id: issueId,
          description,
          created_by: createdBy,
          vote: 0
        })
        .select(`
          id,
          description,
          vote,
          created_at,
          created_by,
          created_by_user:users!comments_created_by_fkey (
            id,
            name,
            email
          )
        `)
        .single();

      if (error) {
        throw new Error(`Failed to create comment: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('CommentService.createComment error:', error);
      throw error;
    }
  }

  // Update a comment
  async updateComment(commentId, description, userId) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('created_by', userId)
        .select(`
          id,
          description,
          vote,
          created_at,
          updated_at,
          created_by,
          created_by_user:users!comments_created_by_fkey (
            id,
            name,
            email
          )
        `)
        .single();

      if (error) {
        throw new Error(`Failed to update comment: ${error.message}`);
      }

      if (!data) {
        throw new Error('Comment not found or not authorized');
      }

      return data;
    } catch (error) {
      console.error('CommentService.updateComment error:', error);
      throw error;
    }
  }

  // Delete a comment
  async deleteComment(commentId, userId) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('created_by', userId)
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to delete comment: ${error.message}`);
      }

      if (!data) {
        throw new Error('Comment not found or not authorized');
      }

      return data;
    } catch (error) {
      console.error('CommentService.deleteComment error:', error);
      throw error;
    }
  }

  // Vote on a comment (upvote/downvote)
  async voteComment(commentId, voteType, userId) {
    try {
      // First, get the current comment
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('vote')
        .eq('id', commentId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch comment: ${fetchError.message}`);
      }

      if (!comment) {
        throw new Error('Comment not found');
      }

      // For now, simple vote increment/decrement
      // In a real app, you'd track user votes separately
      const voteChange = voteType === 'upvote' ? 1 : -1;
      const newVote = comment.vote + voteChange;

      const { data, error } = await supabase
        .from('comments')
        .update({ vote: newVote })
        .eq('id', commentId)
        .select(`
          id,
          description,
          vote,
          created_at,
          created_by,
          created_by_user:users!comments_created_by_fkey (
            id,
            name,
            email
          )
        `)
        .single();

      if (error) {
        throw new Error(`Failed to vote on comment: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('CommentService.voteComment error:', error);
      throw error;
    }
  }
}

export default new CommentService();