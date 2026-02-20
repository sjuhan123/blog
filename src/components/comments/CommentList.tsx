import type { CommentWithReplies } from '../../core/domain/comment';
import { CommentItem } from './CommentItem';

type Props = {
  comments: CommentWithReplies[];
  currentUserId: string | null;
  onDeleteComment: (commentId: string) => void;
  onAddReply: (commentId: string, body: string) => Promise<void>;
  onDeleteReply: (replyId: string) => void;
};

export const CommentList = ({
  comments,
  currentUserId,
  onDeleteComment,
  onAddReply,
  onDeleteReply,
}: Props) => {
  if (comments.length === 0) {
    return (
      <p className="py-6 text-center text-sm opacity-50">
        첫 번째 댓글을 남겨보세요.
      </p>
    );
  }

  return (
    <div>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onDelete={onDeleteComment}
          onAddReply={onAddReply}
          onDeleteReply={onDeleteReply}
        />
      ))}
    </div>
  );
};
