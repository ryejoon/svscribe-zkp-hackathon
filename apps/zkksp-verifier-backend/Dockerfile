FROM rust:1.61.0

# install node
ENV NODE_VERSION=16.13.0
RUN apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

WORKDIR /app
COPY ./dist/apps/zkksp-verifier-backend .
ENV PORT=3334
EXPOSE ${PORT}
RUN npm install --production
# dependencies that nestjs needs
RUN npm install reflect-metadata tslib rxjs @nestjs/platform-express
COPY zokrates/** ./
RUN unzip zkksp-source.zip -d zkksp-source
# install rust
RUN rustup toolchain install nightly-aarch64-unknown-linux-gnu
# build zokrates
WORKDIR /app/zkksp-source
RUN mkdir /root/.zokrates
RUN mkdir /root/.zokrates/stdlib
RUN cp -r /app/zkksp-source/zokrates_stdlib/stdlib /root/.zokrates
# RUN export ZOKRATES_STDLIB=$PWD/zokrates_stdlib/stdlib
RUN cargo +nightly build -p zokrates_cli --release
RUN ln -s /app/zkksp-source/target/release/zokrates /app/zokrates
WORKDIR /root/.zokrates/stdlib
WORKDIR /app
#RUN ./zokrates compile -i sha256.zok
#RUN ./zokrates compute-witness -a 314077308411032793321278816725012958289 316495952764820137513325325447450102725 67428615251739275197038733346106089224 232995379825841761673536055030921300908
#RUN ./zokrates generate-key-proof --output proof.json
CMD node ./main.js
