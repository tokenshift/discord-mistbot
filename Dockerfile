FROM node:lts-buster

WORKDIR /app
COPY *.json /app/
COPY ./src /app/src/
RUN ls -l

RUN npm install
CMD node ./src/index.js
