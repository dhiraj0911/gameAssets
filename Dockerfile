FROM node:16.20.2
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn buildFROM node:20.11.0
WORKDIR /app
COPY . .

# Install NVM
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

# Refresh shell
SHELL ["/bin/bash", "--login", "-c"]

# Install specific node version and set it as default
RUN nvm install 16.20.2
RUN nvm alias default 16.20.2

RUN yarn install
RUN yarn build
RUN yarn global add pm2
EXPOSE 3000
CMD [ "pm2-runtime", "start", "npm", "--name", "my-next-app","--", "start" ]