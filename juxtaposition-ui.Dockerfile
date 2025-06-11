# syntax=docker/dockerfile:1

ARG app_dir="/home/node/app"

FROM node:22-alpine
ARG app_dir
WORKDIR ${app_dir}

COPY . .
RUN npm ci

WORKDIR ${app_dir}/apps/juxtaposition-ui

RUN mkdir -p uploads && chown node:node uploads
RUN npm run build

ENV NODE_ENV=production
USER node

CMD ["npm", "run", "start"]
