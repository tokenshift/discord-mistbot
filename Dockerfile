FROM node:lts-buster

WORKDIR /app
COPY *.json /app/
RUN npm install

COPY ./src /app/src/
CMD node ./src/index.js
