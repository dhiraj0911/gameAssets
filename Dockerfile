FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN yarn install --production
COPY  . .
RUN npm install pm2 -g
CMD ["pm2-runtime", "start", "dist/main.js"]