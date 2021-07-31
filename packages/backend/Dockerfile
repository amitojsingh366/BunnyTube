FROM node:14 AS base

WORKDIR /usr/bunnytube-backend
COPY package.json .env ./

FROM base AS dependencies

RUN yarn install
RUN cp -R node_modules prod_node_modules

FROM base as release
COPY --from=dependencies /usr/bunnytube-backend/prod_node_modules ./node_modules
COPY . .

RUN yarn build
CMD yarn migrate && yarn start