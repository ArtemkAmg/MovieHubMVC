# Етап 1: Збірка проєкту
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копіюємо файл рішення та всі .csproj файли з урахуванням папок для відновлення залежностей
COPY ["MovieHub.sln", "./"]
COPY ["MovieHubMvc/MovieHubMvc.csproj", "MovieHubMvc/"]
COPY ["MovieHubMvc.Services/MovieHubMvc.Services.csproj", "MovieHubMvc.Services/"]

# Відновлюємо залежності для всього рішення
RUN dotnet restore "MovieHub.sln"

# Копіюємо решту вихідного коду проєкту
COPY . .

# Переходимо в папку основного вебпроєкту та публікуємо його
WORKDIR /src/MovieHubMvc
RUN dotnet publish -c Release -o /app/publish

# Етап 2: Запуск застосунку
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Вказуємо порт для Render
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "MovieHubMvc.dll"]
