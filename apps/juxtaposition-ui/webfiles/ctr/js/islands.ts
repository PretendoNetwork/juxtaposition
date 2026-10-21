import { createIslandContainer } from '@common/js/island';

// Actual modules are registered in entrypoint to avoid cyclic imports
export var islands = createIslandContainer();
