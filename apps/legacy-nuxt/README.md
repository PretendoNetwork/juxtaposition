# Legacy Nuxt Experiment

Experiment to get Nuxt/Vue 3 apps running on legacy Nintendo browsers, specifically Miiverse. This may be deleted later, unsure where this will go.

Support is limited, each feature needs to be manually implemented.

Compiler is included in the Nuxt project purely for testing, this should be removed and put into it's own library/project once finished. Likely replacing [Yeah](https://github.com/PretendoNetwork/Yeah).

# Files

- `compiler` - The custom Nuxt/Vue compiler. Generates an Express server with pre-rendered Vue pages into `dist`
- `build.js` - Starts the compilation process
- `runtime` - The custom "Vue runtime" layer that adds reactivity to the apps. Tailored to work on the o3DS

Everything else is a standard Nuxt project

# Features

Almost nothing, only a small number of basic features are implemented to work as a demo