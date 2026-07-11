# Development setup

To get set up with a local instance of Juxtaposition, you need the following things:
- [Docker Desktop](https://docs.docker.com/get-started/get-docker/) (Or docker engine if you're used to that)
- [NodeJS 20+](https://nodejs.org/en/download)

After you have those installed, we will need to set up the following services:
- **Dependent services** - These are all tools that the network needs, like databases and proxies. They run in docker
- **Juxtaposition UI** - The service that serves all the frontend for all platforms
- **Miiverse API** - This is the backend of Juxtaposition UI and miiverse functionality, it's required for the UI to run

## 1. Setting up `Dependent services`

1. Run `docker compose up -d` whiel being in the `/.docker` folder.
2. Follow the initialization steps listed in [`/.docker/README.md`](../.docker/README.md).

That's all, now move on the next step!

## 2. Running `miiverse-api`

1. Go into the `/apps/miiverse-api` folder, create the file `.env` with the following contents:
    ```sh
    PN_MIIVERSE_API_USE_PRESETS=docker
    ```
2. Install required dependencies with `npm i`
3. Initialize the database with `npm run migration:deploy`
4. Run the service with `npm run dev`

You have to keep this server running while testing and using Juxtaposition.

**Tip:** Read [`Extra topics / Databases and migrations`](./extra-topics.md) to learn how to work with the databases of Juxtaposition.

## 3. Running `juxtposition-ui`

1. Go into the `/apps/juxtaposition-ui` folder, create the file `.env` with the following contents:
    ```sh
    PN_JUXTAPOSITION_UI_USE_PRESETS=docker
    ```
2. Install required dependencies with `npm i`
3. Run the service with `npm run dev`

You have also have to keep this server running while testing and using Juxtaposition.

### 4. Connecting with browser

If you want to connect to Juxtaposition through your browser, follow these steps:

1. Install Firefox
2. In firefox, create a new profile for Juxtaposition by going to `profiles > new profile`. Choose a cool name like `juxt`.
3. Go into settings, search for `connection and software security`. Click `Advanced settings` and then `Configure proxy`, configure the following:
    - Select `Manual proxy configuration`
    - HTTP proxy: `localhost`
    - HTTP proxy port: `888`
    - Select `Also use this proxy for HTTPS`
    - Keep the rest as default & press OK
4. Go to `Extensions and themes`, select the settings icon and choose `Install extension from file`
    - Choose the file at `.docker/juxt-cookie-sync/juxt-cookie-sync-1.0.xpi`
    - This will log you in to all Juxtaposition platforms when using your firefox profile.

Done! Now when you use this firefox profile, it will be connected to your local Juxtaposition instance.

### 5. Done!

You now have a working local setup of Juxtaposition!

Here are a couple useful links:
- [Proxy dashboard](http://localhost:8081?token=letmein) (password is `letmein`)
- [Local Juxtaposition web](https://juxt.pretendo.network/) (Use the firefox profile)
- [Local Juxtaposition portal (WiiU)](https://portal.olv.pretendo.cc/) (Use the firefox profile)
- [Local Juxtaposition ctr (3ds)](https://ctr.olv.pretendo.cc/) (Use the firefox profile)
