FROM node:20-alpine

RUN apk add --no-cache python3 make gcc g++ 
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build

VOLUME [ "/app/certs" ]

CMD ["npm", "run", "start"]
