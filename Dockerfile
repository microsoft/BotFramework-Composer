FROM composerbasic

RUN apk add --no-cache \
  ca-certificates \
  \
  # .NET Core dependencies
  krb5-libs \
  libgcc \
  libintl \
  libssl1.1 \
  libstdc++ \
  zlib

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

# Install .NET Core 2.1
ENV DOTNET_SDK_VERSION 2.1.607

RUN wget -O dotnet.tar.gz https://dotnetcli.azureedge.net/dotnet/Sdk/$DOTNET_SDK_VERSION/dotnet-sdk-$DOTNET_SDK_VERSION-linux-musl-x64.tar.gz \
  && dotnet_sha512='61caf6602b8a2aa89769b3e91ddaec963d8ab9f802cd7f6c6da4f02426358712bc2bb0930e7ee3a81d75c7607039543b554cb8ed50e45610655f9e91ed0f2f17' \
  && echo "$dotnet_sha512  dotnet.tar.gz" | sha512sum -c - \
  && mkdir -p /usr/share/dotnet \
  && tar -C /usr/share/dotnet -xzf dotnet.tar.gz \
  && ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet \
  && rm dotnet.tar.gz

# Install .NET Core SDK 3.0
ENV DOTNET_SDK_VERSION 3.0.101

RUN wget -O dotnet.tar.gz https://dotnetcli.azureedge.net/dotnet/Sdk/$DOTNET_SDK_VERSION/dotnet-sdk-$DOTNET_SDK_VERSION-linux-musl-x64.tar.gz \
  && dotnet_sha512='98cc98f58187d208bd388f8c71862ea75e50ca25666e265f40a4e7c28082c2784738172e8ae4af7815057f7c57072cbe4fc03301d01738fc1ed5bb5e4d30a363' \
  && echo "$dotnet_sha512  dotnet.tar.gz" | sha512sum -c - \
  && tar -C /usr/share/dotnet -xzf dotnet.tar.gz \
  && rm dotnet.tar.gz

# Enable detection of running in a container
ENV DOTNET_RUNNING_IN_CONTAINER=true \
  # Set the invariant mode since icu_libs isn't included (see https://github.com/dotnet/announcements/issues/20)
  DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=true

CMD ["yarn","start:server"]
