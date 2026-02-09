// src/lib/ticketsEmail.ts
import QRCode from 'qrcode';

type TicketRow = { ticket_code: string };

type BuildEmailArgs = {
  title: string;
  startsAt: string | Date | null;
  endsAt: string | Date | null;
  buyerName: string;
  quantity: number;
  unitPriceCents: number;
  currency: string;
  tickets: TicketRow[];
};

type ResendAttachment = {
  filename: string;
  content: string; // base64
  content_type: string;
  content_id: string; // CID
};

function formatMoney(cents: number, currency: string) {
  const amt = (cents / 100).toFixed(2);
  return `${currency.toUpperCase()}$${amt}`;
}

function formatDateRange(
  startsAt: string | Date | null,
  endsAt: string | Date | null,
) {
  if (!startsAt) return '';
  const s = new Date(startsAt).toString();
  const e = endsAt ? new Date(endsAt).toString() : '';
  return e ? `${s} to ${e}` : s;
}

function getBaseUrl() {
  // IMPORTANT:
  // Set this on the server env (Vercel + local):
  // local: SITE_URL=http://localhost:3000
  // prod:  SITE_URL=https://junglebirdtikiyyc.com
  const base =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL || // ok as fallback, but SITE_URL is better for server
    'http://localhost:3000';

  return base.replace(/\/$/, '');
}

export async function buildTicketsEmailPayload(
  args: BuildEmailArgs,
): Promise<{ html: string; attachments: ResendAttachment[] }> {
  const {
    title,
    startsAt,
    endsAt,
    buyerName,
    quantity,
    unitPriceCents,
    currency,
    tickets,
  } = args;

  const subtotalCents = unitPriceCents * quantity;
  const baseUrl = getBaseUrl();

  const attachments: ResendAttachment[] = [];
  const ticketBlocks: string[] = [];

  for (let i = 0; i < tickets.length; i++) {
    const code = tickets[i].ticket_code;
    const cid = `ticket-${i + 1}`; // must be unique per ticket

    // QR encodes the code for now (later: encode a scan URL)
    const qrValue = `${baseUrl}/admin/scan?code=${code}`;

    const pngBuffer = await QRCode.toBuffer(qrValue, {
      type: 'png',
      width: 220,
      margin: 1,
      errorCorrectionLevel: 'M',
    });

    attachments.push({
      filename: `ticket-${code}.png`,
      content: pngBuffer.toString('base64'),
      content_type: 'image/png',
      content_id: cid,
    });

    // Fallback link (works even if images are blocked)
    const qrUrl = `${baseUrl}/api/tickets/qr/${code}`;

    ticketBlocks.push(`
      <div style="border:1px solid #eee;border-radius:12px;padding:16px;margin:16px 0;">
        <div style="font-size:14px;color:#555;margin-bottom:8px;">Ticket ${i + 1} of ${tickets.length}</div>
        <div style="font-size:18px;font-weight:700;margin:8px 0;">
          Code: <span style="letter-spacing:1px;">${code}</span>
        </div>

        <div style="margin-top:12px;">
          <img
            src="cid:${cid}"
            alt="Ticket QR Code"
            width="220"
            height="220"
            style="display:block;border:1px solid #eee;border-radius:10px;"
          />
        </div>

        <div style="margin-top:10px;color:#666;font-size:13px;">
          Present this QR code at the door for entry.
        </div>

        <div style="margin-top:10px;color:#666;font-size:12px;">
          If the QR image doesn’t load, open it here:
          <a href="${qrUrl}" style="color:#111;text-decoration:underline;">${qrUrl}</a>
        </div>
      </div>
    `);
  }

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;max-width:680px;margin:0 auto;padding:24px;">
    <h1 style="margin:0 0 8px 0;font-size:32px;">Your Jungle Bird tickets</h1>
    <p style="margin:0 0 18px 0;color:#444;">Hi ${buyerName}, your payment is confirmed. Your tickets are below.</p>

    <div style="border:1px solid #eee;border-radius:12px;padding:16px;margin:16px 0;">
      <div style="font-size:22px;font-weight:800;margin-bottom:6px;">${title}</div>
      <div style="color:#555;font-size:14px;margin-bottom:10px;">
        ${formatDateRange(startsAt, endsAt)}
      </div>
      <div style="color:#555;font-size:14px;margin-bottom:6px;">
        Qty ${quantity}, ${formatMoney(unitPriceCents, currency)} each
      </div>
      <div style="font-size:16px;font-weight:800;">Total: ${formatMoney(subtotalCents, currency)}</div>
    </div>

    ${ticketBlocks.join('')}

    <p style="margin-top:18px;color:#666;font-size:13px;">
      Keep this email handy. If scanning fails, staff can manually enter the ticket code.
    </p>
  </div>
  `;

  return { html, attachments };
}
