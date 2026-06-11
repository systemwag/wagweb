/**
 * Outbound notifications for new contact-form leads.
 *
 * Telegram: set TELEGRAM_BOT_TOKEN (from @BotFather) and TELEGRAM_CHAT_ID
 * (group or personal chat id) in the environment. With either unset the
 * notifier is a silent no-op, so the form keeps working without it.
 */
export async function notifyNewLead(lead: {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return;

  const text = [
    'Новая заявка с сайта west-arlan.kz',
    '',
    `👤 ${lead.name}`,
    `✉️ ${lead.email}`,
    lead.phone ? `📞 ${lead.phone}` : null,
    '',
    lead.message,
  ]
    .filter((line): line is string => line !== null)
    .join('\n')
    // Plain-text message: no parse_mode, so no escaping pitfalls.
    .slice(0, 4000);

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!res.ok) {
    console.error('[notify] telegram sendMessage failed:', res.status, await res.text());
  }
}
