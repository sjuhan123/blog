import type { SortOrder } from '../../core/domain/comment';

type Props = {
  count: number;
  sortOrder: SortOrder;
  onToggleSort: () => void;
};

export const CommentHeader = ({ count, sortOrder, onToggleSort }: Props) => (
  <div className="mb-4 flex items-center justify-between">
    <h3 className="text-sm font-medium">{count}개의 댓글</h3>
    <button
      onClick={onToggleSort}
      className="text-xs opacity-50 transition-opacity hover:opacity-80"
    >
      {sortOrder === 'newest' ? '최신순' : '오래된순'}
    </button>
  </div>
);
