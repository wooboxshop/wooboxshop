import { Product } from '../types';

function createRawEmail(
  to: string,
  from: string,
  subject: string,
  htmlContent: string,
  plainTextContent: string,
  unsubscribeUrl?: string
): string {
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`;

  const headers = [
    `To: ${to}`,
    `From: =?utf-8?B?${btoa(unescape(encodeURIComponent("Woobox Shop")))}?= <${from}>`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];

  if (unsubscribeUrl) {
    headers.push(`List-Unsubscribe: <${unsubscribeUrl}>`);
    headers.push(`List-Unsubscribe-Post: List-Unsubscribe=One-Click`);
  }

  const body = [
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    btoa(unescape(encodeURIComponent(plainTextContent))),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    btoa(unescape(encodeURIComponent(htmlContent))),
    '',
    `--${boundary}--`,
  ];

  const fullEmail = headers.join('\r\n') + '\r\n\r\n' + body.join('\r\n');

  return btoa(unescape(encodeURIComponent(fullEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function getPublicAppUrl(): string {
  if (typeof window !== 'undefined') {
    let origin = window.location.origin;
    // Replace internal AI Studio development URL with the public shared URL
    if (origin.includes('-dev-')) {
      origin = origin.replace('-dev-', '-pre-');
    }
    return origin;
  }
  return 'https://wooboxshop.com';
}

export function generateNewProductEmailContent(
  product: Product,
  subscriberEmail: string,
  appUrl = getPublicAppUrl(),
  storeName = 'Woobox Shop'
): { html: string; plainText: string; unsubscribeUrl: string } {
  const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price);
  const origPriceFormatted = product.originalPrice
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.originalPrice)
    : null;

  const currentYear = new Date().getFullYear();
  const unsubscribeUrl = `${appUrl}/?unsubscribe=${encodeURIComponent(subscriberEmail)}`;

  const plainText = `
WOOBOX SHOP - NOVO ACHADINHO RECÉM-CADASTRADO!

${product.badge ? `[${product.badge.toUpperCase()}] ` : ''}${product.title}

Preço de Oferta: ${priceFormatted} ${origPriceFormatted ? `(De: ${origPriceFormatted})` : ''}

${product.description || 'Confira todos os detalhes deste incrível achadinho no Woobox Shop!'}

Acesse a oferta na loja: ${product.affiliateUrl || appUrl}

---------------------------------------------------
Você recebeu este e-mail porque se cadastrou na newsletter de novidades do ${storeName}.
Para se desinscrever da nossa newsletter, acesse: ${unsubscribeUrl}
© ${currentYear} Woobox Shop - Todos os direitos reservados.
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Achadinho no Woobox Shop</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0d0c15; color: #e4e4e7; margin: 0; padding: 20px;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #12111d; border-radius: 20px; border: 1px solid #27272a; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    
    <!-- Header Logo matching website branding structure -->
    <div style="padding: 28px 24px; text-align: center; background: #07060b; border-bottom: 1px solid #27272a;">
      ${storeName === 'Woobox Shop' ? `
        <div style="display: inline-block; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
          <div style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; line-height: 1; color: #ffffff;">
            <span>WOO</span><span style="color: #ec4899;">B</span><span style="color: #f97316;">O</span><span style="color: #f59e0b;">X</span>
          </div>
          <div style="font-size: 11px; font-weight: 900; letter-spacing: 0.22em; color: #d4d4d8; text-transform: uppercase; margin-top: 3px; line-height: 1;">
            SHOP
          </div>
        </div>
      ` : `
        <div style="font-size: 24px; font-weight: 900; color: #ffffff;">
          ${storeName}
        </div>
      `}
      <p style="margin: 12px 0 0 0; font-size: 13px; color: #a1a1aa; font-weight: 500;">🔥 Novo Achadinho Recém-Cadastrado na Loja!</p>
    </div>

    <!-- Body -->
    <div style="padding: 28px 24px;">
      
      ${product.badge ? `<div style="display: inline-block; background: rgba(236, 72, 153, 0.15); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.4); font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 14px;">${product.badge}</div>` : ''}

      <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 0; margin-bottom: 16px; line-height: 1.3;">${product.title}</h1>

      ${product.imageUrl ? `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${product.imageUrl}" alt="${product.title}" style="width: 100%; max-height: 340px; object-fit: cover; border-radius: 14px; border: 1px solid #27272a;" />
        </div>
      ` : ''}

      <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px; background: #08070d; padding: 14px; border-radius: 12px; border: 1px solid #1f1e2e;">
        ${product.description || 'Confira todos os detalhes deste incrível achadinho e aproveite o desconto exclusivo do Woobox Shop!'}
      </p>

      <!-- Price Box -->
      <div style="background: #181726; border: 1px solid #3f3f46; padding: 18px; border-radius: 14px; text-align: center; margin-bottom: 24px;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #f472b6; font-weight: 800; margin-bottom: 4px;">Preço de Oferta</div>
        <div>
          ${origPriceFormatted ? `<span style="font-size: 15px; text-decoration: line-through; color: #71717a; margin-right: 10px;">${origPriceFormatted}</span>` : ''}
          <span style="font-size: 28px; font-weight: 900; color: #10b981;">${priceFormatted}</span>
        </div>
      </div>

      <!-- Button -->
      <div style="text-align: center; margin-bottom: 12px;">
        <a href="${product.affiliateUrl || appUrl}" target="_blank" style="display: inline-block; width: 100%; box-sizing: border-box; text-align: center; background: #ec4899; color: #ffffff; font-weight: 800; font-size: 16px; padding: 16px 24px; border-radius: 14px; text-decoration: none;">
          🛒 Ver Oferta na Loja &rarr;
        </a>
      </div>

    </div>

    <!-- Footer with Unsubscribe Option -->
    <div style="padding: 20px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #27272a; background-color: #07060b;">
      <p style="margin: 0 0 6px;">Você recebeu este e-mail porque se cadastrou na newsletter de novidades do <strong>${storeName}</strong>.</p>
      <p style="margin: 0 0 10px;">© ${currentYear} Woobox Shop — Todos os direitos reservados.</p>
      <p style="margin: 0; font-size: 11px;">
        Não deseja mais receber nossas notificações? 
        <a href="${unsubscribeUrl}" target="_blank" style="color: #ec4899; text-decoration: underline; font-weight: 600;">Desinscrever-se da newsletter</a>
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();

  return { html, plainText, unsubscribeUrl };
}

export async function sendEmailViaGmail(
  accessToken: string,
  to: string,
  fromEmail: string,
  subject: string,
  htmlContent: string,
  plainTextContent: string,
  unsubscribeUrl?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const raw = createRawEmail(to, fromEmail, subject, htmlContent, plainTextContent, unsubscribeUrl);
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, error: `Erro na API do Gmail (${res.status}): ${errorText}` };
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro ao enviar e-mail via Gmail.' };
  }
}

export async function sendNewProductNotificationToSubscribers(
  accessToken: string,
  fromEmail: string,
  subscribers: string[],
  product: Product,
  appUrl = getPublicAppUrl()
): Promise<{ total: number; sent: number; failed: number; errors: string[] }> {
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  const subject = `🔥 Novo Achadinho: ${product.title}`;

  for (const subscriberEmail of subscribers) {
    if (!subscriberEmail || !subscriberEmail.includes('@')) continue;

    const { html, plainText, unsubscribeUrl } = generateNewProductEmailContent(product, subscriberEmail, appUrl);

    const result = await sendEmailViaGmail(
      accessToken,
      subscriberEmail,
      fromEmail,
      subject,
      html,
      plainText,
      unsubscribeUrl
    );

    if (result.success) {
      sent++;
    } else {
      failed++;
      if (result.error) errors.push(`${subscriberEmail}: ${result.error}`);
    }
  }

  return {
    total: subscribers.length,
    sent,
    failed,
    errors,
  };
}

