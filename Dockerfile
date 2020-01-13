FROM node:11.15.0

EXPOSE 3000 6500

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

RUN npm install

COPY . /app

CMD ["npm", "run", "start"]
