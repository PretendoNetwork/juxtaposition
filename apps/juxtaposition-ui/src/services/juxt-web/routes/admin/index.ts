import { Router } from 'express';
import { adminRouter } from '@/services/juxt-web/routes/admin/admin';
import { adminAutomodRouter } from '@/services/juxt-web/routes/admin/adminAutomod';

export const baseAdminRouter = Router();

baseAdminRouter.use(adminRouter);
baseAdminRouter.use(adminAutomodRouter);
