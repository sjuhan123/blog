import { useState } from 'react';

type Props = {
  onSubmit: (body: string) => Promise<void>;
  onCancel: () => void;
};

export const ReplyForm = ({ onSubmit, onCancel }: Props) => {
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
      setBody('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ml-6 mt-2 flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="답글을 입력하세요..."
        maxLength={500}
        rows={2}
        autoFocus
        className="w-full resize-none rounded border border-[rgb(var(--color-border-main))] bg-transparent px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[rgb(var(--color-border-main))]"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-xs opacity-60 hover:opacity-80"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!body.trim() || isSubmitting}
          className="rounded border border-[rgb(var(--color-border-main))] px-3 py-1 text-xs transition-opacity hover:opacity-70 disabled:opacity-40"
        >
          {isSubmitting ? '작성 중...' : '답글'}
        </button>
      </div>
    </form>
  );
};
