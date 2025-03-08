# ⚡Juxtaposition

Juxtaposition is the Pretendo made Miiverse replacement and successor.

## 🍄 Philosophy

This project is meant not just be a simple clone of Miiverse. We aim to extend what it had to offer and bring the platform into the modern era.

We want to bring all features originally found in Miiverse into Juxtaposition and expand it with even more features.

## ⚠️ Limitations

- The web platforms on the 3DS and WiiU are old, thus we need to use old web methodologies like AJAX. 
- The XML API of the Miiverse platform cannot be modified or extended, it needs to stay exactly as the consoles expect it.

# 🧬 Running locally for development

Prerequisites:
- Clone the repository
- Have a functional running [account server](https://github.com/PretendoNetwork/account) and [friends server](https://github.com/PretendoNetwork/friends)
- Have NodeJS 20 or higher installed
- Optional: have docker installed (highly recommended)

After the prerequisites you need to run the following inside `.docker`:
```sh
docker compose up -d
```
If you are not using docker for development, please set up the services listed in `.docker/docker-compose.yml` manually.

Next up, you need to run the two services in `/apps`:
```bash
cd apps/miiverse-api
npm i
npm run dev
```

And in another terminal:
```bash
cd apps/juxtaposition-ui
npm i
npm run dev
```

You have to also make an `.env` file to configure your environment. Inspire it from the schema in `src/config.ts` in each service.

# 🤝 Translation

If you'd like to help localize Pretendo Network, you can contribute to the translations on our project on [Weblate](https://hosted.weblate.org/engage/pretendonetwork/).

# 🤝 Contributors

[![Contributors](https://contrib.rocks/image?repo=pretendoNetwork/juxtaposition)](https://github.com/pretendoNetwork/juxtaposition/graphs/contributors)
