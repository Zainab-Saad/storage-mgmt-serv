FROM node:20.9.0

WORKDIR /storage-mgmt-serv

COPY package.json .

RUN yarn install

COPY . .

CMD yarn prisma:generate && PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=true yarn prisma:migrate:dev && sleep 5 && yarn start