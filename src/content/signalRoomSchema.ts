import { z } from 'zod';

export const signalRoomSchema = z.object({
  title: z.string(),
  episode: z.number(),
  /** Month-level publication date — used for ordering and the RSS feed. */
  date: z.coerce.date(),
  /** One-line teaser shown on the index and used as the page description. */
  teaser: z.string(),
  /** Chip texts rendered above the episode title, e.g. "episode 01". */
  badges: z.array(z.string()),
});
