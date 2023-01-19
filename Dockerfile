#################
#
# Because Composer is organized as a monorepo with multiple packages
# managed by yarn workspaces, our Dockerfile may not look like other
# node / react projects. Specifically, we have to add all source files
# before doing yarn install due to yarn workspace symlinking.
#
################
FROM mcr.microsoft.com/dotnet/core/sdk:3.1-focal as base
RUN apt update \
    && apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt install -y nodejs libgomp1 \
    && corepack enable \
    && corepack prepare yarn@3.2.1 --activate \
    && yarn --version

FROM base as build
ARG YARN_ARGS

WORKDIR /src/Composer
COPY ./Composer .
COPY ./extensions ../extensions
COPY ./.yarn ../.yarn
COPY .yarnrc.yml ../
# run yarn install as a distinct layer
RUN yarn install --immutable $YARN_ARGS
ENV NODE_OPTIONS "--max-old-space-size=6114"
ENV NODE_ENV "production"
ENV COMPOSER_BUILTIN_EXTENSIONS_DIR "/src/extensions"
RUN yarn build:prod $YARN_ARGS

# CI only
ENV COMPOSER_REMOTE_EXTENSIONS_DIR "/src/remote-extensions"
ENV COMPOSER_REMOTE_EXTENSION_DATA_DIR "/src/extension-data"
ENV COMPOSER_EXTENSION_MANIFEST "/src/extensions.json"
ENV COMPOSER_HOST="0.0.0.0"
CMD ["yarn","start:server"]

FROM base as composerbasic
ARG YARN_ARGS

WORKDIR /app/Composer
COPY --from=build /src/.yarn ../.yarn
COPY --from=build /src/.yarnrc.yml ../
COPY --from=build /src/Composer/yarn-berry.lock .
COPY --from=build /src/Composer/package.json .
COPY --from=build /src/Composer/packages ./packages
COPY --from=build /src/extensions ../extensions

ENV NODE_ENV "production"
RUN yarn install --immutable $YARN_ARGS && yarn cache clean

FROM base
ENV NODE_ENV "production"

WORKDIR /app/Composer
COPY --from=composerbasic /app ..


ENV COMPOSER_BUILTIN_EXTENSIONS_DIR "/app/extensions"
ENV COMPOSER_REMOTE_EXTENSIONS_DIR "/app/remote-extensions"
ENV COMPOSER_REMOTE_EXTENSION_DATA_DIR "/app/extension-data"
ENV COMPOSER_EXTENSION_MANIFEST "/app/extensions.json"
ENV COMPOSER_HOST="0.0.0.0"
CMD ["yarn","start:server"]
