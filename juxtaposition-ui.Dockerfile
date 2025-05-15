# syntax=docker/dockerfile:1

ARG app_dir="/home/node/app"

FROM node:20-alpine
ARG app_dir
WORKDIR ${app_dir}

COPY . .

RUN npm ci
RUN mkdir -p ${app_dir}/uploads && chown node:node ${app_dir}/uploads

ENV NODE_ENV=production
USER node

WORKDIR ${app_dir}/apps/juxtaposition-ui
CMD ["npm", "run", "start"]
