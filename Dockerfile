FROM mhart/alpine-node:8.11.4

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

EXPOSE 5000

# You can change this
CMD [ "npm", "start" ]