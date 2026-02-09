// src/app/api/tickets/qr/[ticketCode]/route.ts
import QRCode from 'qrcode';

export const runtime = 'nodejs';

function isValidTicketCode(code: string) {
  return /^[0-9A-F]{12}$/.test(code);
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

  // after you generate png (a Buffer)
  const png = await QRCode.toBuffer(code, {
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
