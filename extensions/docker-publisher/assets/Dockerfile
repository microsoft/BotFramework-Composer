FROM mcr.microsoft.com/dotnet/sdk:3.1 as SDK
ARG EXECUTABLE
ARG COMPOSER

WORKDIR /src
COPY . .

#RUN dotnet restore
#RUN dotnet build -c Release --no-restore
#RUN dotnet publish --no-build --no-restore -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:3.1
ARG EXECUTABLE
ARG COMPOSER

WORKDIR /app
#COPY --from=SDK /app .
#COPY --from=SDK /src/run.sh .

EXPOSE 5000
EXPOSE 5001
EXPOSE 80
EXPOSE 443

ENV MicrosoftAppPassword ""
ENV LuisEnpointKey ""
ENV QnAEndpointKey ""
ENV SkillHostEndpoint ""
ENV DLL ${EXECUTABLE}

SHELL ["/bin/bash", "-c"]
RUN echo $'#!/bin/bash\n\
\n\
args=() \n\
args+=("run") \n\
args+=($DLL) \n\
\n\
[[ ! -z "$MicrosoftAppPassword" ]] && args+=("--MicrosoftAppPassword $MicrosoftAppPassword")\n\
[[ ! -z "$LuisEnpointKey" ]] && args+=("--luis:endpointKey $LuisEnpointKey")\n\
[[ ! -z "$QnAEndpointKey" ]] && args+=("--MicrosoftAppPassword $QnAEndpointKey")\n\
[[ ! -z "$SkillHostEndpoint" ]] && args+=("--SkillHostEndpoint $SkillHostEndpoint")\n\
\n\
[[ "$COMPOSER" == "DEBUG" ]] && echo "dotnet ${args[@]}"\n\
dotnet "${args[@]}"' > ./run.sh && chmod +x ./run.sh

ENTRYPOINT [ "./run.sh" ]