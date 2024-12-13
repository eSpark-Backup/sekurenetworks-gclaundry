FROM node:lts-alpine
ENV NODE_ENV=Production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --legacy-peer-deps && mv node_modules ../
COPY . .
RUN npm run build
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "run", "preview"]