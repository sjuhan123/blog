import type {
  Comment,
  CommentWithReplies,
  Reply,
  SortOrder,
} from '../../core/domain/comment';
import type { ICommentRepository } from '../../core/usecases/comment';
import { supabase } from '../../lib/supabase';

type DBComment = {
  id: string;
  post_slug: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  body: string;
  status: 'published' | 'hidden';
  created_at: string;
  replies?: DBReply[];
};

type DBReply = {
  id: string;
  comment_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  body: string;
  status: 'published' | 'hidden';
  created_at: string;
};

const mapReply = (r: DBReply): Reply => ({
  id: r.id,
  commentId: r.comment_id,
  userId: r.user_id,
  userName: r.user_name,
  userAvatar: r.user_avatar,
  body: r.body,
  status: r.status,
  createdAt: r.created_at,
});

const mapComment = (c: DBComment): Comment => ({
  id: c.id,
  postSlug: c.post_slug,
  userId: c.user_id,
  userName: c.user_name,
  userAvatar: c.user_avatar,
  body: c.body,
  status: c.status,
  createdAt: c.created_at,
});

const mapCommentWithReplies = (c: DBComment): CommentWithReplies => ({
  ...mapComment(c),
  replies: (c.replies ?? []).map(mapReply),
});

export const commentRepository: ICommentRepository = {
  async fetchComments(postSlug: string, sortOrder: SortOrder) {
    const { data, error } = await supabase
      .from('comments')
      .select('*, replies(*)')
      .eq('post_slug', postSlug)
      .eq('status', 'published')
      .order('created_at', { ascending: sortOrder === 'oldest' });

    if (error) throw error;
    return (data as DBComment[]).map(mapCommentWithReplies);
  },

  async addComment({ postSlug, userId, userName, userAvatar, body }) {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_slug: postSlug,
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar,
        body,
      })
      .select()
      .single();

    if (error) throw error;
    return mapComment(data as DBComment);
  },

  async deleteComment(commentId: string) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  },

  async addReply({ commentId, userId, userName, userAvatar, body }) {
    const { data, error } = await supabase
      .from('replies')
      .insert({
        comment_id: commentId,
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar,
        body,
      })
      .select()
      .single();

    if (error) throw error;
    return mapReply(data as DBReply);
  },

  async deleteReply(replyId: string) {
    const { error } = await supabase.from('replies').delete().eq('id', replyId);

    if (error) throw error;
  },
};
