import '@/extend-zod'; // Needs to be the first import

// Disable config validation for the generation entrypoint
process.env.SKIP_CONFIG_VALIDATION = 'true';

await import('@/services/internal');
const { writeOpenapiToFile } = await import('@/services/internal/builder/openapi');

writeOpenapiToFile();
