FROM node:20
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production=true
COPY  . .
RUN npm install pm2 -g
CMD ["pm2-runtime", "start", "dist/main.js"]