import '@/extend-zod'; // Needs to be the first import
import '@/services/internal';
import { writeOpenapiToFile } from '@/services/internal/builder/openapi';

writeOpenapiToFile();
