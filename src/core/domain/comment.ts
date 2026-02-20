export type AuthUser = {
  id: string;
  name: string;
  avatar: string | null;
  email: string;
};

export type Comment = {
  id: string;
  postSlug: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  body: string;
  status: 'published' | 'hidden';
  createdAt: string;
};

export type Reply = {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  body: string;
  status: 'published' | 'hidden';
  createdAt: string;
};

export type CommentWithReplies = Comment & {
  replies: Reply[];
};

export type SortOrder = 'newest' | 'oldest';

export const sortComments = (
  comments: CommentWithReplies[],
  sortOrder: SortOrder,
): CommentWithReplies[] => {
  return [...comments].sort((a, b) => {
    const diff =
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sortOrder === 'newest' ? -diff : diff;
  });
};
