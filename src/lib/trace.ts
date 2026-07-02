// deterministic plotter-style trace for the homepage instrument strip.
// pure and dependency free so the same seed yields the same line at build
// time (inline svg fallback) and in the browser (canvas draw).

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type TracePoint = [number, number];

// a calm line: three seeded sinusoids plus a little jitter, amplitude
// roughly 30% of the height, centered vertically.
export function tracePoints(
  seed: number,
  width: number,
  height: number,
  samples: number,
  amplitudeScale = 1,
): TracePoint[] {
  const rand = mulberry32(seed);
  const mid = height / 2;
  const amp = height * 0.3 * amplitudeScale;

  const f1 = 1.5 + rand() * 1.5;
  const f2 = 3 + rand() * 3;
  const f3 = 6 + rand() * 5;
  const p1 = rand() * Math.PI * 2;
  const p2 = rand() * Math.PI * 2;
  const p3 = rand() * Math.PI * 2;

  const points: TracePoint[] = [];
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    const wave =
      0.6 * Math.sin(t * Math.PI * f1 + p1) +
      0.3 * Math.sin(t * Math.PI * f2 + p2) +
      0.1 * Math.sin(t * Math.PI * f3 + p3);
    const jitter = (rand() - 0.5) * 0.08;
    const y = mid + (wave + jitter) * amp;
    points.push([t * width, y]);
  }
  return points;
}

export function toSvgPath(points: TracePoint[]): string {
  if (points.length === 0) return '';
  const fmt = (n: number) => n.toFixed(2).replace(/\.00$/, '');
  let d = `M${fmt(points[0][0])} ${fmt(points[0][1])}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L${fmt(points[i][0])} ${fmt(points[i][1])}`;
  }
  return d;
}

// changes daily, identical across build and client for a given utc day.
export function traceSeed(daysRunning: number, now: Date): number {
  const utcDay = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));
  return daysRunning * 31 + utcDay;
}
