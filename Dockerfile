# Build stage
FROM node:8-alpine as builder

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

ENV PATH=$PATH:/home/node/.npm-global/bin

USER node

RUN npm install

COPY . .

RUN npm run build

# Deployment stage
FROM node:8-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

ENV PATH=$PATH:/home/node/.npm-global/bin

USER node

RUN npm install --only=production

COPY . .

RUN mkdir dist

COPY --from=builder /home/node/app/dist ./dist

CMD ["node", "dist/taskmaster.js"]
