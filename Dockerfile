FROM node:20.11.1
WORKDIR /app
COPY  . .
RUN yarn install
RUN yarn build
CMD ["yarn", "start"]