FROM node:10-alpine as build
WORKDIR /src/Composer

# yes, docker copy is really this stupid, https://github.com/moby/moby/issues/15858
COPY yarn.lock .
COPY .npmrc .
COPY package.json .
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/
COPY packages/lib/package.json ./packages/lib/
COPY packages/lib/cci-graph-lib/package.json ./packages/lib/cci-graph-lib/
COPY packages/lib/code-editor/package.json ./packages/lib/code-editor/
COPY packages/extensions/package.json ./packages/extensions/
COPY packages/extensions/obieditortest/package.json ./packages/extensions/obieditortest/
COPY packages/extensions/sample-json-editor/package.json ./packages/extensions/sample-json-editor/
COPY packages/extensions/visual-designer/package.json ./packages/extensions/visual-designer/

# run yarn install as a distinct layer
RUN yarn install

COPY . .
RUN yarn build

# use a multi-stage build to reduce the final image size
FROM node:10-alpine
WORKDIR /app/Composer/server
COPY --from=build /src/Composer/packages/server .

RUN yarn --production && yarn cache clean
CMD ["node", "build/server.js"]
