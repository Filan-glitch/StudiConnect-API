FROM node:20.9.0-alpine3.18 AS builder

RUN mkdir -p /server && chown -R node:node /server
WORKDIR /server

RUN npm install -g typescript
RUN npm install -g ts-node
COPY package.json .

USER node
RUN npm install

COPY --chown=node:node . .
RUN npm run build


FROM node:20.9.0-alpine3.18
RUN mkdir -p /server && \
    chown -R node:node /server && \
    apk add --no-cache tzdata curl && \
    cp /usr/share/zoneinfo/Europe/Berlin /etc/localtime && \
    echo "Europe/Berlin" > /etc/timezone && \
    apk del tzdata

WORKDIR /server

COPY package.json .
USER node
RUN npm install --omit=dev

COPY --from=builder /server/build .
COPY --chown=node:node firebase-private.pem .
COPY --chown=node:node .env.prod .env

EXPOSE 8080 8081
CMD [ "node", "index.js" ]
