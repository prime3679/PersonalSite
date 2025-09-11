// From javascript_sendgrid integration
import { MailService } from '@sendgrid/mail';

let mailService: MailService | null = null;
let isConfigured = false;

function configureSendGrid() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn('SENDGRID_API_KEY not configured - email functionality disabled');
    return false;
  }
  
  try {
    mailService = new MailService();
    mailService.setApiKey(apiKey);
    isConfigured = true;
    return true;
  } catch (error) {
    console.error('Failed to configure SendGrid:', error);
    return false;
  }
}

// Configure on first import
configureSendGrid();

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

interface EmailParams {
  to: string;
  subject: string;
  text: string;
  userEmail: string;
  userName: string;
  userMessage: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!isConfigured || !mailService) {
    console.warn('SendGrid not configured - cannot send email');
    return false;
  }
  
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@adrianlumley.com';
  
  try {
    // Create safe HTML version with escaped content
    const safeHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(params.userName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(params.userEmail)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(params.subject)}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; white-space: pre-wrap;">
        ${escapeHtml(params.userMessage)}
      </div>
      <p><em>Submitted on ${new Date().toLocaleString()}</em></p>
    `;
    
    const msg = {
      to: params.to,
      from: fromEmail,
      replyTo: params.userEmail,
      subject: `Contact Form: ${escapeHtml(params.subject)}`,
      text: params.text,
      html: safeHtml
    };
    
    await mailService.send(msg);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}