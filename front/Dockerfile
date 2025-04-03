FROM node:20

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=development
RUN npm install --include=dev

COPY . .

ENV WATCHPACK_POLLING=true

EXPOSE 3001

CMD ["sh", "-c", "npm install && PORT=3001 npm start"]