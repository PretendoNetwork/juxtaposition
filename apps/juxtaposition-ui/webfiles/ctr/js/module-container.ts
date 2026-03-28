import { createModuleContainer } from '@repo/frontend-common';

// Actual modules are registered in entrypoint to avoid cyclic imports
export var modules = createModuleContainer();
