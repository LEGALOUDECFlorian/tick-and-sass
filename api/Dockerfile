FROM node:20-alpine

WORKDIR /usr/src/api

COPY package*.json ./
RUN npm i

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

ENV PORT=4005
EXPOSE 4005

CMD ["npm", "run", "start"]