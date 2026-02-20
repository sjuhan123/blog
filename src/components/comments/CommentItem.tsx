import { useState } from 'react';

import type { CommentWithReplies, Reply } from '../../core/domain/comment';
import { ReplyForm } from './ReplyForm';
import { ReplyItem } from './ReplyItem';

type Props = {
  comment: CommentWithReplies;
  currentUserId: string | null;
  onDelete: (commentId: string) => void;
  onAddReply: (commentId: string, body: string) => Promise<void>;
  onDeleteReply: (replyId: string) => void;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export const CommentItem = ({
  comment,
  currentUserId,
  onDelete,
  onAddReply,
  onDeleteReply,
}: Props) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleAddReply = async (body: string) => {
    await onAddReply(comment.id, body);
    setShowReplyForm(false);
    setShowReplies(true);
  };

  return (
    <div className="flex flex-col gap-2 border-b border-[rgb(var(--color-border-main))] border-opacity-30 py-3 last:border-0">
      <div className="flex items-center gap-2">
        {comment.userAvatar && (
          <img
            src={comment.userAvatar}
            alt={comment.userName}
            className="h-5 w-5 rounded-full"
            referrerPolicy="no-referrer"
          />
        )}
        <span className="text-xs font-medium">{comment.userName}</span>
        <span className="text-xs opacity-50">
          {formatDate(comment.createdAt)}
        </span>
        {currentUserId === comment.userId && (
          <button
            onClick={() => onDelete(comment.id)}
            className="ml-auto text-xs opacity-40 hover:opacity-70"
            aria-label="댓글 삭제"
          >
            삭제
          </button>
        )}
      </div>
      <p className="text-sm">{comment.body}</p>
      <div className="flex items-center gap-3">
        {currentUserId && (
          <button
            onClick={() => setShowReplyForm((v) => !v)}
            className="text-xs opacity-50 hover:opacity-80"
          >
            답글
          </button>
        )}
        {comment.replies.length > 0 && (
          <button
            onClick={() => setShowReplies((v) => !v)}
            className="text-xs opacity-50 hover:opacity-80"
          >
            {showReplies ? '답글 접기' : `답글 ${comment.replies.length}개`}
          </button>
        )}
      </div>
      {showReplyForm && (
        <ReplyForm
          onSubmit={handleAddReply}
          onCancel={() => setShowReplyForm(false)}
        />
      )}
      {showReplies && (
        <div className="mt-1 flex flex-col gap-2">
          {comment.replies.map((reply: Reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              currentUserId={currentUserId}
              onDelete={onDeleteReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};
