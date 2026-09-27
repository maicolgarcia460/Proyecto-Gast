FROM node:24

WORKDIR /app

COPY Backend/package*.json ./

RUN npm install

COPY Backend/ .

COPY Frontend/ /Frontend/

EXPOSE 3000

CMD ["node", "server.js"]