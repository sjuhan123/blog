type Props = {
  onLogin: () => void;
};

export const LoginPrompt = ({ onLogin }: Props) => (
  <div className="flex items-center justify-between rounded border border-[rgb(var(--color-border-main))] px-4 py-3 text-sm opacity-70">
    <span>로그인하고 댓글을 작성하세요.</span>
    <button
      onClick={onLogin}
      className="text-xs underline underline-offset-2 hover:opacity-80"
    >
      Google 로그인
    </button>
  </div>
);
