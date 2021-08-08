# -------- Step 1 - Base node --------

FROM node:alpine AS base

WORKDIR /bunnytube
COPY package.json yarn.lock ./
COPY packages/website/package.json ./website/

# -------- Step 2 - Dependencies --------

FROM base AS dependencies

RUN yarn install

# -------- Step 4 - Build website --------

FROM base AS website-builder

COPY packages/website ./website
COPY --from=dependencies /bunnytube/node_modules ./node_modules

WORKDIR /bunnytube/website
RUN yarn install
RUN yarn build

# -------- Step 5 - Start website --------

FROM node:alpine as website-runner

WORKDIR /bunnytube

COPY --from=website-builder /bunnytube/website/public ./website/public
COPY --from=website-builder /bunnytube/website/.next ./website/.next
COPY --from=website-builder /bunnytube/node_modules ./node_modules
COPY --from=website-builder /bunnytube/website/package.json ./website/package.json

WORKDIR /bunnytube/website
RUN yarn add next


EXPOSE 3000
CMD [ "yarn", "start" ]

