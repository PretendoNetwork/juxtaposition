import { Router } from 'express';
import { adminRouter } from '@/services/juxt-web/routes/admin/admin';
import { adminAutomodRouter } from '@/services/juxt-web/routes/admin/adminAutomod';
import { adminUserRouter } from '@/services/juxt-web/routes/admin/adminUser';

export const baseAdminRouter = Router();

baseAdminRouter.use(adminRouter);
baseAdminRouter.use(adminAutomodRouter);
baseAdminRouter.use(adminUserRouter);
