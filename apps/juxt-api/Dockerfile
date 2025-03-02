FROM node:20-alpine

RUN apk add --no-cache python3 make gcc g++ 
WORKDIR /app

COPY "docker/entrypoint.sh" ./

COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build

VOLUME [ "/app/config.json", "/app/certs" ]

CMD ["sh", "entrypoint.sh"]
