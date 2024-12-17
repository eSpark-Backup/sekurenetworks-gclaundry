FROM node:lts-alpine
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm cache clean --force
RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate

RUN npm run build
RUN chown -R node /usr/src/app
USER node

CMD ["npm", "run", "start:migrate:prod"]