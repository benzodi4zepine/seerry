import CalibreWeb from '@server/api/calibreWeb';
import logger from '@server/logger';
import { Router } from 'express';
import { z } from 'zod';

const ebooksRoutes = Router();

const SearchSchema = z.object({
  q: z.string().default(''),
});

ebooksRoutes.get('/search', async (req, res, next) => {
  try {
    const { q } = SearchSchema.parse(req.query);

    const baseUrl =
      process.env.CALIBRE_WEB_URL ?? 'https://calibre-web.apexnova.live';
    const username = process.env.CALIBRE_WEB_USER;
    const password = process.env.CALIBRE_WEB_PASS;

    if (!baseUrl) {
      return res.status(503).json({ error: 'Calibre-Web URL not configured' });
    }

    const client = new CalibreWeb({
      baseUrl,
      username,
      password,
    });

    const results = await client.search(q || '');

    return res.status(200).json({ results });
  } catch (e) {
    logger.error('Failed to search Calibre-Web', { error: e });
    return next({ status: 500, message: 'Failed to search Calibre-Web' });
  }
});

export default ebooksRoutes;
