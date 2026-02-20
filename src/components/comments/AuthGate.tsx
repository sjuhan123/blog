import type { AuthUser } from '../../core/domain/comment';

type Props = {
  user: AuthUser;
  onLogout: () => void;
};

export const AuthGate = ({ user, onLogout }: Props) => (
  <div className="flex items-center gap-2 text-xs opacity-60">
    {user.avatar && (
      <img
        src={user.avatar}
        alt={user.name}
        className="h-5 w-5 rounded-full"
        referrerPolicy="no-referrer"
      />
    )}
    <span>{user.name}</span>
    <button onClick={onLogout} className="ml-auto hover:underline">
      로그아웃
    </button>
  </div>
);
