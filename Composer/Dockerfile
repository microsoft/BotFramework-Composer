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


# Define arg(s) needed for the From statement
FROM alpine:3.8 as installer-env

# Define Args for the needed to add the package
ARG PS_VERSION=6.2.0
ARG PS_PACKAGE=powershell-${PS_VERSION}-linux-alpine-x64.tar.gz
ARG PS_PACKAGE_URL=https://github.com/PowerShell/PowerShell/releases/download/v${PS_VERSION}/${PS_PACKAGE}
ARG PS_INSTALL_VERSION=6

# Download the Linux tar.gz and save it
ADD ${PS_PACKAGE_URL} /tmp/linux.tar.gz

# define the folder we will be installing PowerShell to
ENV PS_INSTALL_FOLDER=/opt/microsoft/powershell/$PS_INSTALL_VERSION

# Create the install folder
RUN mkdir -p ${PS_INSTALL_FOLDER}

# Unzip the Linux tar.gz
RUN tar zxf /tmp/linux.tar.gz -C ${PS_INSTALL_FOLDER} -v





FROM alpine:3.10
# Copy only the files we need from the previous stage
COPY --from=installer-env ["/opt/microsoft/powershell", "/opt/microsoft/powershell"]

# Define Args and Env needed to create links
ARG PS_INSTALL_VERSION=6
ENV PS_INSTALL_FOLDER=/opt/microsoft/powershell/$PS_INSTALL_VERSION \
  \
  # Define ENVs for Localization/Globalization
  DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false \
  LC_ALL=en_US.UTF-8 \
  LANG=en_US.UTF-8 \
  # set a fixed location for the Module analysis cache
  PSModuleAnalysisCachePath=/var/cache/microsoft/powershell/PSModuleAnalysisCache/ModuleAnalysisCache

# Install dotnet dependencies and ca-certificates
RUN apk add --no-cache \
  ca-certificates \
  less \
  \
  # PSReadline/console dependencies
  ncurses-terminfo-base \
  \
  # .NET Core dependencies
  krb5-libs \
  libgcc \
  libintl \
  libssl1.1 \
  libstdc++ \
  tzdata \
  userspace-rcu \
  zlib \
  icu-libs \
  && apk -X https://dl-cdn.alpinelinux.org/alpine/edge/main add --no-cache \
  lttng-ust \
  \
  # Create the pwsh symbolic link that points to powershell
  && ln -s ${PS_INSTALL_FOLDER}/pwsh /usr/bin/pwsh \
  # Give all user execute permissions and remove write permissions for others
  && chmod a+x,o-w ${PS_INSTALL_FOLDER}/pwsh \
  # intialize powershell module cache
  && pwsh \
  -NoLogo \
  -NoProfile \
  -Command " \
  \$ErrorActionPreference = 'Stop' ; \
  \$ProgressPreference = 'SilentlyContinue' ; \
  while(!(Test-Path -Path \$env:PSModuleAnalysisCachePath)) {  \
  Write-Host "'Waiting for $env:PSModuleAnalysisCachePath'" ; \
  Start-Sleep -Seconds 6 ; \
  }"

# Define args needed only for the labels
ARG PS_VERSION=6.2.0
ARG IMAGE_NAME=mcr.microsoft.com/powershell:alpine-3.8
ARG VCS_REF="none"

# Add label last as it's just metadata and uses a lot of parameters
LABEL maintainer="PowerShell Team <powershellteam@hotmail.com>" \
  readme.md="https://github.com/PowerShell/PowerShell/blob/master/docker/README.md" \
  description="This Dockerfile will install the latest release of PowerShell." \
  org.label-schema.usage="https://github.com/PowerShell/PowerShell/tree/master/docker#run-the-docker-image-you-built" \
  org.label-schema.url="https://github.com/PowerShell/PowerShell/blob/master/docker/README.md" \
  org.label-schema.vcs-url="https://github.com/PowerShell/PowerShell-Docker" \
  org.label-schema.name="powershell" \
  org.label-schema.vendor="PowerShell" \
  org.label-schema.vcs-ref=${VCS_REF} \
  org.label-schema.version=${PS_VERSION} \
  org.label-schema.schema-version="1.0" \
  org.label-schema.docker.cmd="docker run ${IMAGE_NAME} pwsh -c '$psversiontable'" \
  org.label-schema.docker.cmd.devel="docker run ${IMAGE_NAME}" \
  org.label-schema.docker.cmd.test="docker run ${IMAGE_NAME} pwsh -c Invoke-Pester" \
  org.label-schema.docker.cmd.help="docker run ${IMAGE_NAME} pwsh -c Get-Help"

# Install .Net Core SDK
ENV \
  # Unset the value from the base image
  ASPNETCORE_URLS= \
  # Disable the invariant mode (set in base image)
  DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false \
  # Enable correct mode for dotnet watch (only mode supported in a container)
  DOTNET_USE_POLLING_FILE_WATCHER=true \
  LC_ALL=en_US.UTF-8 \
  LANG=en_US.UTF-8 \
  # Skip extraction of XML docs - generally not useful within an image/container - helps performance
  NUGET_XMLDOC_MODE=skip \
  # PowerShell telemetry for docker image usage
  POWERSHELL_DISTRIBUTION_CHANNEL=PSDocker-DotnetCoreSDK-Alpine-3.10

# Add dependencies for disabling invariant mode (set in base image)
RUN apk add --no-cache icu-libs

# Install .NET Core SDK and .NET Core Runtime
RUN dotnet_sdk_version=3.1.100 \
  && dotnet_version=3.1.0 \
  && wget -O dotnet.tar.gz https://dotnetcli.azureedge.net/dotnet/Sdk/$dotnet_sdk_version/dotnet-sdk-$dotnet_sdk_version-linux-musl-x64.tar.gz \
  && dotnet_sha512='517c1dadbc9081e112f75589eb7160ef70183eb3d93fd55800e145b21f4dd6f5fbe19397ee7476aa16493e112ef95b311ff61bb08d9231b30a7ea609806d85ee' \
  && echo "$dotnet_sha512  dotnet.tar.gz" | sha512sum -c - \
  && mkdir -p /usr/share/dotnet \
  && tar -C /usr/share/dotnet -oxzf dotnet.tar.gz \
  && ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet \
  && rm dotnet.tar.gz \
  # Trigger first run experience by running arbitrary cmd
  && dotnet help

# Enable detection of running in a container
ENV DOTNET_RUNNING_IN_CONTAINER=true \
  # Set the invariant mode since icu_libs isn't included (see https://github.com/dotnet/announcements/issues/20)
  DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=true

# Install nodejs
ENV NODE_VERSION 12.13.1
RUN addgroup -g 1000 node \
  && adduser -u 1000 -G node -s /bin/sh -D node \
  && apk add --no-cache \
  libstdc++ \
  && apk add --no-cache --virtual .build-deps \
  curl \
  && ARCH= && alpineArch="$(apk --print-arch)" \
  && case "${alpineArch##*-}" in \
  x86_64) \
  ARCH='x64' \
  CHECKSUM="cf493d306a6367fb7bcff5608731e1dd44b9ad8d64e7df7706916d8be0f497a1" \
  ;; \
  *) ;; \
  esac \
  && if [ -n "${CHECKSUM}" ]; then \
  set -eu; \
  curl -fsSLO --compressed "https://unofficial-builds.nodejs.org/download/release/v$NODE_VERSION/node-v$NODE_VERSION-linux-$ARCH-musl.tar.xz"; \
  echo "$CHECKSUM  node-v$NODE_VERSION-linux-$ARCH-musl.tar.xz" | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-$ARCH-musl.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs; \
  else \
  echo "Building from source" \
  # backup build
  && apk add --no-cache --virtual .build-deps-full \
  binutils-gold \
  g++ \
  gcc \
  gnupg \
  libgcc \
  linux-headers \
  make \
  python \
  # gpg keys listed at https://github.com/nodejs/node#release-keys
  && for key in \
  94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
  FD3A5288F042B6850C66B31F09FE44734EB7990E \
  71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
  DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
  C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  B9AE9905FFD7803F25714661B63B535A4C206CA9 \
  77984A986EBC2AA786BC0F66B01FBB92821C587A \
  8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600 \
  4ED778F539E3634C779C87C6D7062848A1AB005C \
  A48C2BEE680E841632CD4E44F07496B3EB3C1762 \
  B9E2F5981AA6E0CD28160D9FF13993A75599653C \
  ; do \
  gpg --batch --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || \
  gpg --batch --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" || \
  gpg --batch --keyserver hkp://pgp.mit.edu:80 --recv-keys "$key" ; \
  done \
  && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION.tar.xz" \
  && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xf "node-v$NODE_VERSION.tar.xz" \
  && cd "node-v$NODE_VERSION" \
  && ./configure \
  && make -j$(getconf _NPROCESSORS_ONLN) V= \
  && make install \
  && apk del .build-deps-full \
  && cd .. \
  && rm -Rf "node-v$NODE_VERSION" \
  && rm "node-v$NODE_VERSION.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt; \
  fi \
  && rm -f "node-v$NODE_VERSION-linux-$ARCH-musl.tar.xz" \
  && apk del .build-deps

ENV YARN_VERSION 1.19.1

RUN apk add --no-cache --virtual .build-deps-yarn curl gnupg tar \
  && for key in \
  6A010C5166006599AA17F08146C2130DFD2497F5 \
  ; do \
  gpg --batch --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || \
  gpg --batch --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" || \
  gpg --batch --keyserver hkp://pgp.mit.edu:80 --recv-keys "$key" ; \
  done \
  && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
  && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz.asc" \
  && gpg --batch --verify yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
  && mkdir -p /opt \
  && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
  && ln -s /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
  && ln -s /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
  && rm yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
  && apk del .build-deps-yarn

WORKDIR /app/Composer
COPY --from=build /src/Composer/yarn.lock .
COPY --from=build /src/Composer/package.json .
COPY --from=build /src/Composer/packages/server ./packages/server
COPY --from=build /src/Composer/packages/lib ./packages/lib
COPY --from=build /src/Composer/packages/tools ./packages/tools

ENV NODE_ENV "production"
ENV DEBUG "composer*"
RUN yarn --production --frozen-lockfile --force && yarn cache clean
WORKDIR /app/Composer
CMD ["yarn", "start:server"]