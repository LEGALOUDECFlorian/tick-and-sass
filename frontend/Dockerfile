FROM node:20-alpine AS base

WORKDIR /usr/src/frontend

COPY package*.json ./

RUN npm install

COPY . .

CMD npm run dev