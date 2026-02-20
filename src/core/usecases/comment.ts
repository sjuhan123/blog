import type {
  AuthUser,
  Comment,
  CommentWithReplies,
  Reply,
  SortOrder,
} from '../domain/comment';

export interface ICommentRepository {
  fetchComments(
    postSlug: string,
    sortOrder: SortOrder,
  ): Promise<CommentWithReplies[]>;
  addComment(params: {
    postSlug: string;
    userId: string;
    userName: string;
    userAvatar: string | null;
    body: string;
  }): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;
  addReply(params: {
    commentId: string;
    userId: string;
    userName: string;
    userAvatar: string | null;
    body: string;
  }): Promise<Reply>;
  deleteReply(replyId: string): Promise<void>;
}

export interface IAuthRepository {
  getUser(): Promise<AuthUser | null>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void;
}

export class CommentUseCases {
  constructor(private repo: ICommentRepository) {}

  fetchComments(postSlug: string, sortOrder: SortOrder) {
    return this.repo.fetchComments(postSlug, sortOrder);
  }

  addComment(
    postSlug: string,
    userId: string,
    userName: string,
    userAvatar: string | null,
    body: string,
  ) {
    return this.repo.addComment({
      postSlug,
      userId,
      userName,
      userAvatar,
      body,
    });
  }

  deleteComment(commentId: string) {
    return this.repo.deleteComment(commentId);
  }

  addReply(
    commentId: string,
    userId: string,
    userName: string,
    userAvatar: string | null,
    body: string,
  ) {
    return this.repo.addReply({
      commentId,
      userId,
      userName,
      userAvatar,
      body,
    });
  }

  deleteReply(replyId: string) {
    return this.repo.deleteReply(replyId);
  }
}

export class AuthUseCases {
  constructor(private repo: IAuthRepository) {}

  getUser() {
    return this.repo.getUser();
  }

  signInWithGoogle() {
    return this.repo.signInWithGoogle();
  }

  signOut() {
    return this.repo.signOut();
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.repo.onAuthStateChange(callback);
  }
}
