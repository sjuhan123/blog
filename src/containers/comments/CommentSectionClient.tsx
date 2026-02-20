import { useCallback, useEffect, useState } from 'react';

import { AuthGate } from '../../components/comments/AuthGate';
import { CommentForm } from '../../components/comments/CommentForm';
import { CommentHeader } from '../../components/comments/CommentHeader';
import { CommentList } from '../../components/comments/CommentList';
import { LoginPrompt } from '../../components/comments/LoginPrompt';
import type {
  AuthUser,
  CommentWithReplies,
  SortOrder,
} from '../../core/domain/comment';
import { AuthUseCases, CommentUseCases } from '../../core/usecases/comment';
import { authRepository } from '../../infra/supabase/authRepository';
import { commentRepository } from '../../infra/supabase/commentRepository';

const defaultCommentUseCases = new CommentUseCases(commentRepository);
const defaultAuthUseCases = new AuthUseCases(authRepository);

type Props = {
  postSlug: string;
  commentUseCases?: CommentUseCases;
  authUseCases?: AuthUseCases;
};

const CommentSectionClient = ({
  postSlug,
  commentUseCases = defaultCommentUseCases,
  authUseCases = defaultAuthUseCases,
}: Props) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [isLoading, setIsLoading] = useState(true);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await commentUseCases.fetchComments(postSlug, sortOrder);
      setComments(data);
    } catch {
      // 조용히 실패
    } finally {
      setIsLoading(false);
    }
  }, [commentUseCases, postSlug, sortOrder]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    authUseCases.getUser().then(setUser);
    const unsubscribe = authUseCases.onAuthStateChange(setUser);
    return unsubscribe;
  }, [authUseCases]);

  const handleLogin = () => authUseCases.signInWithGoogle();
  const handleLogout = () => authUseCases.signOut();

  const handleAddComment = async (body: string) => {
    if (!user) return;
    const newComment = await commentUseCases.addComment(
      postSlug,
      user.id,
      user.name,
      user.avatar,
      body,
    );
    setComments((prev) =>
      sortOrder === 'newest'
        ? [{ ...newComment, replies: [] }, ...prev]
        : [...prev, { ...newComment, replies: [] }],
    );
  };

  const handleDeleteComment = async (commentId: string) => {
    await commentUseCases.deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleAddReply = async (commentId: string, body: string) => {
    if (!user) return;
    const newReply = await commentUseCases.addReply(
      commentId,
      user.id,
      user.name,
      user.avatar,
      body,
    );
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, newReply] } : c,
      ),
    );
  };

  const handleDeleteReply = async (replyId: string) => {
    await commentUseCases.deleteReply(replyId);
    setComments((prev) =>
      prev.map((c) => ({
        ...c,
        replies: c.replies.filter((r) => r.id !== replyId),
      })),
    );
  };

  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'));
  };

  return (
    <section className="mt-10">
      <CommentHeader
        count={comments.length}
        sortOrder={sortOrder}
        onToggleSort={handleToggleSort}
      />
      {user ? (
        <div className="mb-4 flex flex-col gap-3">
          <AuthGate user={user} onLogout={handleLogout} />
          <CommentForm onSubmit={handleAddComment} />
        </div>
      ) : (
        <div className="mb-4">
          <LoginPrompt onLogin={handleLogin} />
        </div>
      )}
      {isLoading ? (
        <p className="py-6 text-center text-sm opacity-50">로딩 중...</p>
      ) : (
        <CommentList
          comments={comments}
          currentUserId={user?.id ?? null}
          onDeleteComment={handleDeleteComment}
          onAddReply={handleAddReply}
          onDeleteReply={handleDeleteReply}
        />
      )}
    </section>
  );
};

export default CommentSectionClient;
