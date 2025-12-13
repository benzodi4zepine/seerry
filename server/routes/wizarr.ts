import WizarrClient from '@server/api/wizarr';
import { Permission } from '@server/lib/permissions';
import logger from '@server/logger';
import { isAuthenticated } from '@server/middleware/auth';
import { Router } from 'express';

const wizarrRoutes = Router();

wizarrRoutes.get(
  '/users',
  isAuthenticated(Permission.ADMIN),
  async (_req, res, next) => {
    try {
      const baseUrl = process.env.WIZARR_URL ?? 'https://wizarr.apexnova.live';
      const token = process.env.WIZARR_TOKEN;

      if (!token) {
        return res.status(503).json({ error: 'Wizarr token not configured' });
      }

      const client = new WizarrClient({ baseUrl, token });
      const users = await client.getUsers();

      return res.status(200).json({ users });
    } catch (e) {
      logger.error('Failed to fetch Wizarr users', { error: e });
      return next({
        status: 500,
        message: 'Unable to fetch Wizarr users',
      });
    }
  }
);

export default wizarrRoutes;
