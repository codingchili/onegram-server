FROM node:latest

RUN mkdir -p /opt/onegram
WORKDIR /opt/onegram
COPY ./ /opt/onegram

RUN npm install

EXPOSE 1443
CMD [ "npm", "start" ]