import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs';

let fontData: ArrayBuffer | null = null;

async function getFont(): Promise<ArrayBuffer> {
  if (fontData) return fontData;

  // Try local system font first (Courier on macOS)
  const systemFont = '/System/Library/Fonts/Courier.dfont';
  const monoFont = '/System/Library/Fonts/Supplemental/Courier New.ttf';

  if (fs.existsSync(monoFont)) {
    fontData = fs.readFileSync(monoFont).buffer as ArrayBuffer;
    return fontData;
  }

  // Fallback: fetch Inter from Google Fonts
  const res = await fetch(
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap',
    { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } },
  );
  const css = await res.text();
  const fontUrl = css.match(/src: url\(([^)]+)\)/)?.[1];
  if (!fontUrl) throw new Error('Could not find font URL');
  const fontRes = await fetch(fontUrl);
  fontData = await fontRes.arrayBuffer();
  return fontData;
}

export async function generateOgImage(title: string, subtitle: string): Promise<Buffer> {
  const font = await getFont();

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#0a0a0a',
          padding: '80px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '48px',
                      fontWeight: 400,
                      color: '#fafafa',
                      lineHeight: 1.3,
                    },
                    children: title,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '20px',
                      color: '#a1a1aa',
                      lineHeight: 1.5,
                    },
                    children: subtitle,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                position: 'absolute',
                bottom: '80px',
                left: '80px',
                fontSize: '18px',
                color: '#52525b',
                letterSpacing: '0.05em',
              },
              children: 'adrianlumley.co',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Mono',
          data: font,
          weight: 400,
          style: 'normal' as const,
        },
      ],
    },
  );

  return await sharp(Buffer.from(svg)).png().toBuffer();
}
