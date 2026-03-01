import path from 'path';
import express from 'express';
import { distFolder } from '@/util';
export const staticRouter = express.Router();

const webFilesRoot = path.join(distFolder, 'webfiles');
staticRouter.use('/assets', express.static(webFilesRoot));

const webFilesGlobalRoot = path.join(distFolder, 'webfiles', 'global');
staticRouter.use('/', express.static(webFilesGlobalRoot));
