FROM node:20
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production=true
COPY  . .
CMD ["yarn", "start"]