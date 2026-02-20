import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const BLOG_OWNER_EMAIL = Deno.env.get('BLOG_OWNER_EMAIL')!;
const BLOG_URL = Deno.env.get('BLOG_URL') ?? 'https://den-eight.vercel.app';
const RESEND_FROM_EMAIL =
  Deno.env.get('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev';

const URL_REGEX = /https?:\/\/[^\s]+/g;

type WebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'comments' | 'replies';
  schema: 'public';
  record: Record<string, unknown>;
};

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: RESEND_FROM_EMAIL, to, subject, html }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Resend error:', text);
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  if (payload.type !== 'INSERT') {
    return new Response('OK', { status: 200 });
  }

  const body = String(payload.record.body ?? '');
  const urlMatches = body.match(URL_REGEX);
  if (urlMatches && urlMatches.length >= 2) {
    console.log('Spam detected — skipping notification');
    return new Response('OK', { status: 200 });
  }

  if (payload.table === 'comments') {
    const postSlug = String(payload.record.post_slug ?? '');
    const userName = String(payload.record.user_name ?? '익명');
    const postUrl = `${BLOG_URL}/blog/${postSlug}`;

    await sendEmail(
      BLOG_OWNER_EMAIL,
      `[블로그] 새 댓글: ${userName}`,
      `<p><strong>${userName}</strong>님이 <a href="${postUrl}">${postSlug}</a> 포스트에 댓글을 남겼습니다.</p>
       <blockquote>${body}</blockquote>
       <p><a href="${postUrl}">댓글 보러 가기</a></p>`,
    );
  } else if (payload.table === 'replies') {
    const commentId = String(payload.record.comment_id ?? '');
    const userName = String(payload.record.user_name ?? '익명');
    const replyUserId = String(payload.record.user_id ?? '');

    // service_role 클라이언트로 원댓글 조회
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: commentData } = await adminClient
      .from('comments')
      .select('post_slug, user_id')
      .eq('id', commentId)
      .single();

    const postSlug = String(commentData?.post_slug ?? '');
    const postUrl = `${BLOG_URL}/blog/${postSlug}`;

    // 블로그 주인에게 알림
    await sendEmail(
      BLOG_OWNER_EMAIL,
      `[블로그] 새 대댓글: ${userName}`,
      `<p><strong>${userName}</strong>님이 <a href="${postUrl}">${postSlug}</a> 포스트의 댓글에 답글을 남겼습니다.</p>
       <blockquote>${body}</blockquote>
       <p><a href="${postUrl}">답글 보러 가기</a></p>`,
    );

    // 원댓글 작성자가 블로그 주인과 다를 경우 별도 알림
    if (commentData?.user_id && commentData.user_id !== replyUserId) {
      const {
        data: { user: originalUser },
      } = await adminClient.auth.admin.getUserById(
        String(commentData.user_id),
      );
      const originalEmail = originalUser?.email;
      if (originalEmail && originalEmail !== BLOG_OWNER_EMAIL) {
        const originalName =
          (originalUser?.user_metadata?.full_name as string) ??
          (originalUser?.user_metadata?.name as string) ??
          '작성자';
        await sendEmail(
          originalEmail,
          `[블로그] 내 댓글에 답글이 달렸어요`,
          `<p><strong>${userName}</strong>님이 <strong>${originalName}</strong>님의 댓글에 답글을 남겼습니다.</p>
           <blockquote>${body}</blockquote>
           <p><a href="${postUrl}">답글 보러 가기</a></p>`,
        );
      }
    }
  }

  return new Response('OK', { status: 200 });
});
