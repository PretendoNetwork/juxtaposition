import { Router } from 'express';
import { adminRouter } from '@/services/juxt-web/routes/admin/admin';
import { adminAutomodRouter } from '@/services/juxt-web/routes/admin/adminAutomod';
import { adminUserRouter } from '@/services/juxt-web/routes/admin/adminUser';
import { adminAnnouncementRouter } from '@/services/juxt-web/routes/admin/adminAnnouncements';

export const baseAdminRouter = Router();

baseAdminRouter.use(adminRouter);
baseAdminRouter.use(adminAutomodRouter);
baseAdminRouter.use(adminAnnouncementRouter);
baseAdminRouter.use(adminUserRouter);
