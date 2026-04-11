FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY *.csproj .
RUN dotnet restore Api.csproj

COPY . .
RUN dotnet publish Api.csproj -c Release -o /LogInPage/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

WORKDIR /app
COPY --from=build /LogInPage/publish .
ENTRYPOINT ["dotnet", "Api.dll"]