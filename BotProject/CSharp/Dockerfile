FROM mcr.microsoft.com/dotnet/core/sdk:2.1-alpine AS build

WORKDIR /app/botproject/csharp

COPY *.sln .
COPY *.csproj .
COPY NuGet.Config .

# run restore to create a distinct layer
RUN dotnet restore

COPY . .
RUN dotnet publish -o out

FROM mcr.microsoft.com/dotnet/core/aspnet:2.1-alpine AS runtime
WORKDIR /app/botproject/csharp
COPY --from=build /app/botproject/csharp/out .
CMD ["dotnet", "BotProject.dll"]