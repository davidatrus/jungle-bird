import QRCode from 'qrcode';
import { getVenueConfig, type VenueKey } from '@/lib/venueConfig';

type TicketRow = { ticket_code: string };

type BuildEmailArgs = {
  venueKey?: VenueKey;
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
  content: string;
  content_type: string;
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

function getVenueSiteUrl(venueKey: VenueKey) {
  const config = getVenueConfig(venueKey);
  return config.siteUrl.replace(/\/$/, '');
}

function getBrandCopy(venueKey: VenueKey) {
  const config = getVenueConfig(venueKey);

  return {
    emailHeading: `Your ${config.brandName} tickets`,
    confirmationLine: 'your payment is confirmed. Your tickets are below.',
    doorLine: 'Present this QR code at the door for entry.',
    helperLine:
      'Keep this email handy. If scanning fails, staff can manually enter the ticket code.',
  };
}

export async function buildTicketsEmailPayload(
  args: BuildEmailArgs,
): Promise<{ html: string; attachments: ResendAttachment[] }> {
  const {
    venueKey = 'jungle_bird',
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
  const baseUrl = getVenueSiteUrl(venueKey);
  const config = getVenueConfig(venueKey);
  const brand = getBrandCopy(venueKey);
  const eventBasePath = `${config.basePath}/events`;

  const attachments: ResendAttachment[] = [];
  const ticketBlocks: string[] = [];

  for (let i = 0; i < tickets.length; i++) {
    const code = tickets[i].ticket_code;

    const scanUrl = `${baseUrl}/admin/scan?code=${code}`;
    const qrImageUrl = `${baseUrl}/api/tickets/qr/${code}`;

    const pngBuffer = await QRCode.toBuffer(scanUrl, {
      type: 'png',
      width: 220,
      margin: 1,
      errorCorrectionLevel: 'M',
    });

    attachments.push({
      filename: `ticket-${code}.png`,
      content: pngBuffer.toString('base64'),
      content_type: 'image/png',
    });

    ticketBlocks.push(`
      <div style="border:1px solid #eee;border-radius:12px;padding:16px;margin:16px 0;">
        <div style="font-size:14px;color:#555;margin-bottom:8px;">Ticket ${i + 1} of ${tickets.length}</div>

        <div style="font-size:18px;font-weight:700;margin:8px 0;">
          Code: <span style="letter-spacing:1px;">${code}</span>
        </div>

        <div style="margin-top:12px;">
          <img
            src="${qrImageUrl}"
            alt="Ticket QR Code"
            width="220"
            height="220"
            style="display:block;border:1px solid #eee;border-radius:10px;"
          />
        </div>

        <div style="margin-top:10px;color:#666;font-size:13px;">
          ${brand.doorLine}
        </div>

        <div style="margin-top:10px;color:#666;font-size:12px;">
          If the QR image doesn’t load, open it here:
          <a href="${qrImageUrl}" style="color:#111;text-decoration:underline;">${qrImageUrl}</a>
        </div>
      </div>
    `);
  }

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;max-width:680px;margin:0 auto;padding:24px;">
    <h1 style="margin:0 0 8px 0;font-size:32px;">${brand.emailHeading}</h1>
    <p style="margin:0 0 18px 0;color:#444;">Hi ${buyerName}, ${brand.confirmationLine}</p>

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
      ${brand.helperLine}
    </p>

    <p style="margin-top:10px;color:#666;font-size:12px;">
      Event page:
      <a href="${baseUrl}${eventBasePath}" style="color:#111;text-decoration:underline;">${baseUrl}${eventBasePath}</a>
    </p>
  </div>
  `;

  return { html, attachments };
}
