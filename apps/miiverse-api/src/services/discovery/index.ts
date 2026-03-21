import express from 'express';
import discoveryHandlers from '@/services/discovery/routes/discovery';
import { restrictHostnames } from '@/middleware/hostLimit';
import { config } from '@/config';

// Main router for endpointsindex.js
const router = express.Router();

// Router to handle the subdomain restriction
const discovery = express.Router();

// Create subdomains
router.use(restrictHostnames([config.domains.discovery], discovery));

// Setup routes
discovery.use('/v1/endpoint', discoveryHandlers);

export default router;
