FROM node:16.20.2
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build
RUN yarn global add pm2
EXPOSE 3000
CMD [ "pm2-runtime", "start", "npm", "--name", "my-next-app","--", "start" ]