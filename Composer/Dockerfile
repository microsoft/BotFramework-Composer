FROM node:10-alpine
WORKDIR /src/Composer
COPY . .

# install git because yarn install requires git
RUN apk add git 
# rm yarn.lock because consistenly hit https://github.com/yarnpkg/yarn/issues/6312, and remove yarn.lock works for me
RUN rm yarn.lock && yarn install && yarn build
    

# use a multi-stage build to reduce the final image size
FROM node:10-alpine
WORKDIR /app/Composer/server
COPY --from=0 /src/Composer/packages/server .

RUN yarn --production && yarn cache clean
CMD ["node", "build/server.js"]