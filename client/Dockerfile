FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

ENV IS_DOCKER=true

CMD ["npm", "run", "dev"]
