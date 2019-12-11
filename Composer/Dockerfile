#################
#
# Because Composer is organized as a monorepo with multiple packages
# managed by yarn workspaces, our Dockerfile may not look like other
# node / react projects. Specifically, we have to add all source files
# before doing yarn install due to yarn workspace symlinking.
#
################

FROM node:12-alpine as build

WORKDIR /src/Composer
COPY . .
# run yarn install as a distinct layer
RUN yarn install --frozen-lock-file
ENV NODE_OPTIONS "--max-old-space-size=4096"
ENV NODE_ENV "production"
RUN yarn build:prod


# use a multi-stage build to reduce the final image size
FROM node:12-alpine

WORKDIR /app/Composer
COPY --from=build /src/Composer/yarn.lock .
COPY --from=build /src/Composer/package.json .
COPY --from=build /src/Composer/packages/server ./packages/server
COPY --from=build /src/Composer/packages/lib ./packages/lib
COPY --from=build /src/Composer/packages/tools ./packages/tools

ENV NODE_ENV "production"
RUN yarn --production --frozen-lockfile --force && yarn cache clean
WORKDIR /app/Composer
CMD ["yarn", "start:server"]
