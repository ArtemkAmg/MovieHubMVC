# Етап 1: Збірка проєкту
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копіюємо файл проєкту та відновлюємо залежності
COPY ["MovieHubMvc.csproj", "./"]
RUN dotnet restore "MovieHubMvc.csproj"

# Копіюємо решту файлів та публікуємо
COPY . .
RUN dotnet publish "MovieHubMvc.csproj" -c Release -o /app/publish

# Етап 2: Запуск застосунку
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Вказуємо порт для Render
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "MovieHubMvc.dll"]