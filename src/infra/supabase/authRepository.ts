import type { AuthUser } from '../../core/domain/comment';
import type { IAuthRepository } from '../../core/usecases/comment';
import { supabase } from '../../lib/supabase';

type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata: Record<string, string>;
};

const mapUser = (user: SupabaseUser): AuthUser => ({
  id: user.id,
  name: user.user_metadata.full_name ?? user.user_metadata.name ?? 'Anonymous',
  avatar: user.user_metadata.avatar_url ?? user.user_metadata.picture ?? null,
  email: user.email ?? '',
});

export const authRepository: IAuthRepository = {
  async getUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return mapUser(user as SupabaseUser);
  },

  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href,
      },
    });
    if (error) throw error;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  onAuthStateChange(callback) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback(mapUser(session.user as SupabaseUser));
      } else {
        callback(null);
      }
    });
    return () => subscription.unsubscribe();
  },
};
