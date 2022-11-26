FROM node:lts-alpine
WORKDIR /app
COPY ./dist/apps/zkksp-prover-angular .
RUN npm install http-server -g
ENV PORT=3332
EXPOSE ${PORT}
CMD http-server ./ -p ${PORT}

