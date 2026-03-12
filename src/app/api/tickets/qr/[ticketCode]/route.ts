import QRCode from 'qrcode';

export const runtime = 'nodejs';

function isValidTicketCode(code: string) {
  return /^[0-9A-F]{12}$/.test(code);
}

function getPublicBaseUrl() {
  const base =
    process.env.SITE_URL ||
    process.env.TICKETS_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    '';

  return base.replace(/\/$/, '');
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ ticketCode: string }> },
) {
  const { ticketCode } = await ctx.params;
  const code = (ticketCode ?? '').toUpperCase();

  if (!isValidTicketCode(code)) {
    return new Response('Invalid ticket code', { status: 400 });
  }

  const baseUrl = getPublicBaseUrl();
  const qrValue = baseUrl ? `${baseUrl}/admin/scan?code=${code}` : code;

  const png = await QRCode.toBuffer(qrValue, {
    type: 'png',
    margin: 1,
    scale: 8,
    errorCorrectionLevel: 'M',
  });

  return new Response(new Uint8Array(png), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store',
    },
  });
}
