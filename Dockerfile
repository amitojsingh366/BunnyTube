# -------- Step 1 - Base node --------

FROM node:alpine AS base

WORKDIR /bunnytube
COPY package.json yarn.lock ./
COPY packages/website/package.json ./website/
COPY packages/wrapper/package.json ./wrapper/

# -------- Step 2 - Dependencies --------

FROM base AS dependencies

RUN yarn install

# -------- Step 3 - Build wrapper --------

FROM base AS wrapper-builder

COPY packages/wrapper ./wrapper
COPY --from=dependencies /bunnytube/node_modules ./node_modules

WORKDIR /bunnytube/wrapper
RUN yarn install
RUN yarn build

COPY ./ /bunnytube/node_modules/@bunnytube/wrapper

# -------- Step 4 - Build website --------

FROM base AS website-builder

COPY packages/website ./website
COPY --from=wrapper-builder /bunnytube/wrapper/lib ./wrapper/lib
COPY --from=dependencies /bunnytube/node_modules ./node_modules

WORKDIR /bunnytube/website
RUN yarn install --ignore-scripts --prefer-offline
RUN yarn build

# -------- Step 5 - Start website --------

FROM node:alpine as website-runner

WORKDIR /bunnytube

# Copy wrapper
COPY --from=wrapper-builder /bunnytube/wrapper/lib ./wrapper/lib


RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=website-builder /bunnytube/website/public ./website/public
COPY --from=website-builder --chown=nextjs:nodejs /bunnytube/website/.next ./website/.next
COPY --from=website-builder /bunnytube/node_modules ./node_modules
COPY --from=website-builder /bunnytube/website/package.json ./website/package.json

USER nextjs

WORKDIR /bunnytube/website

EXPOSE 3000

CMD [ "yarn", "start" ]

