FROM node:18-alpine
WORKDIR /usr/src/app
COPY . .
RUN yarn

CMD ["yarn", "run", "start:dev"]