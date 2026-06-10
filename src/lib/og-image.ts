import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

// Self-hosted JetBrains Mono (the site's font), read at build time. Using a
// local TTF keeps the OG cards on-brand and removes the build-time Google Fonts
// fetch. Satori needs TTF/OTF/WOFF — not the WOFF2 the browser uses.
let fontData: Buffer | null = null;

function getFont(): Buffer {
  if (!fontData) {
    fontData = fs.readFileSync(
      path.join(process.cwd(), 'src/lib/fonts/JetBrainsMono-Regular.ttf'),
    );
  }
  return fontData;
}

export async function generateOgImage(title: string, subtitle: string): Promise<Buffer> {
  const font = getFont();

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
          fontFamily: 'JetBrains Mono',
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
          name: 'JetBrains Mono',
          data: font,
          weight: 400,
          style: 'normal' as const,
        },
      ],
    },
  );

  return await sharp(Buffer.from(svg)).png().toBuffer();
}
