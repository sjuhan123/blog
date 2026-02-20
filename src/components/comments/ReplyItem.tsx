import type { Reply } from '../../core/domain/comment';

type Props = {
  reply: Reply;
  currentUserId: string | null;
  onDelete: (replyId: string) => void;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export const ReplyItem = ({ reply, currentUserId, onDelete }: Props) => (
  <div className="ml-6 flex flex-col gap-1 border-l border-[rgb(var(--color-border-main))] pl-3 opacity-90">
    <div className="flex items-center gap-2">
      {reply.userAvatar && (
        <img
          src={reply.userAvatar}
          alt={reply.userName}
          className="h-4 w-4 rounded-full"
          referrerPolicy="no-referrer"
        />
      )}
      <span className="text-xs font-medium">{reply.userName}</span>
      <span className="text-xs opacity-50">{formatDate(reply.createdAt)}</span>
      {currentUserId === reply.userId && (
        <button
          onClick={() => onDelete(reply.id)}
          className="ml-auto text-xs opacity-40 hover:opacity-70"
          aria-label="답글 삭제"
        >
          삭제
        </button>
      )}
    </div>
    <p className="text-xs">{reply.body}</p>
  </div>
);
