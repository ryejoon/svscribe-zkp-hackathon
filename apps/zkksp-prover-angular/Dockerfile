FROM node:lts-alpine
WORKDIR /app
COPY ./dist/apps/zkksp-prover-angular .
ENV PORT=3332
EXPOSE ${PORT}
RUN npm install --production
RUN npm install reflect-metadata tslib rxjs hbs
CMD node ./main.js
