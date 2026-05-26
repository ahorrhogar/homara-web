import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM_DEFAULT = "Homara <noreply@homara.es>";

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

export async function sendEmail({ to, subject, html, text, from }: SendEmailParams) {
  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email:dev-fallback] to=${to} subject="${subject}"\n${text ?? html}`);
      return { id: "dev-fallback", skipped: true as const };
    }
    throw new Error("RESEND_API_KEY is not set");
  }
  const { data, error } = await resend.emails.send({
    from: from ?? FROM_DEFAULT,
    to,
    subject,
    html,
    text,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
  return { id: data?.id ?? "unknown", skipped: false as const };
}
