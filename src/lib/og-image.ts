import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

// Self-hosted Newsreader + Geist Mono (the site's fonts), read at build time.
// Using local woff files keeps the OG cards on-brand and removes the
// build-time Google Fonts fetch. Satori needs TTF/OTF/WOFF , not the WOFF2
// the browser uses.
let serifFont: Buffer | null = null;
let monoFont: Buffer | null = null;

function getFonts(): { serif: Buffer; mono: Buffer } {
  if (!serifFont || !monoFont) {
    // Read from source at build time. This is a static build (CWD = project
    // root, src/ present, OG PNGs generated ahead of time), so cwd-relative is
    // reliable here. `new URL(..., import.meta.url)` does NOT work: it resolves
    // to the bundled dist/ location where the fonts aren't copied.
    serifFont = fs.readFileSync(
      path.join(process.cwd(), 'src/lib/fonts/newsreader-latin-500-normal.woff'),
    );
    monoFont = fs.readFileSync(
      path.join(process.cwd(), 'src/lib/fonts/geist-mono-latin-400-normal.woff'),
    );
  }
  return { serif: serifFont, mono: monoFont };
}

const PAPER = '#f7f3ea';
const INK = '#1c1814';
const INK_SOFT = '#574f44';
const ACCENT = '#a8472c';

export async function generateOgImage(
  title: string,
  subtitle: string,
  kicker = 'adrianlumley.co',
): Promise<Buffer> {
  const { serif, mono } = getFonts();
  const titleSize = title.length > 40 ? 52 : 64;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: PAPER,
          fontFamily: 'Geist Mono',
        },
        children: [
          // Masthead rule across the very top of the card.
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                width: '100%',
                height: '4px',
                backgroundColor: ACCENT,
              },
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1,
                padding: '80px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            fontFamily: 'Geist Mono',
                            fontSize: '20px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: ACCENT,
                            marginBottom: '28px',
                          },
                          children: kicker,
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            fontFamily: 'Newsreader',
                            fontWeight: 500,
                            fontSize: `${titleSize}px`,
                            color: INK,
                            lineHeight: 1.1,
                            marginBottom: '28px',
                          },
                          children: title,
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            fontFamily: 'Geist Mono',
                            fontSize: '22px',
                            color: INK_SOFT,
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
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            fontFamily: 'Geist Mono',
                            fontSize: '18px',
                            color: INK_SOFT,
                          },
                          children: 'adrianlumley.co',
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            width: '10px',
                            height: '10px',
                            backgroundColor: ACCENT,
                          },
                        },
                      },
                    ],
                  },
                },
              ],
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
          name: 'Newsreader',
          data: serif,
          weight: 500,
          style: 'normal' as const,
        },
        {
          name: 'Geist Mono',
          data: mono,
          weight: 400,
          style: 'normal' as const,
        },
      ],
    },
  );

  return await sharp(Buffer.from(svg)).png().toBuffer();
}

/** The response shape shared by every OG endpoint under src/pages/og/. */
export function pngResponse(png: Buffer): Response {
  // Re-wrap as a plain Uint8Array: Node's Buffer isn't a DOM BodyInit type.
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
}
