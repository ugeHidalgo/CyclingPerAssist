FROM node:24-alpine AS frontend-build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api-build

WORKDIR /src

COPY backend/src/CyclingPerformanceAssistant.Api/CyclingPerformanceAssistant.Api.csproj ./CyclingPerformanceAssistant.Api/
RUN dotnet restore ./CyclingPerformanceAssistant.Api/CyclingPerformanceAssistant.Api.csproj

COPY backend/src/CyclingPerformanceAssistant.Api/ ./CyclingPerformanceAssistant.Api/
RUN dotnet publish ./CyclingPerformanceAssistant.Api/CyclingPerformanceAssistant.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /out

FROM postgres:16-bookworm AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl supervisor \
    && curl -fsSL https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb -o /tmp/packages-microsoft-prod.deb \
    && dpkg -i /tmp/packages-microsoft-prod.deb \
    && rm /tmp/packages-microsoft-prod.deb \
    && apt-get update \
    && apt-get install -y --no-install-recommends aspnetcore-runtime-10.0 \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system app \
    && useradd --system --gid app --groups postgres --home-dir /app --no-create-home app \
    && install -d -o postgres -g postgres -m 0770 /var/run/postgresql \
    && install -d -o app -g app /app

WORKDIR /app

COPY --from=api-build /out/ ./
COPY --from=frontend-build /app/dist/ ./wwwroot/
COPY backend/src/CyclingPerformanceAssistant.Api/Runtime/entrypoint.sh ./entrypoint.sh
COPY backend/src/CyclingPerformanceAssistant.Api/Runtime/supervisord.conf /etc/supervisor/supervisord.conf

RUN chmod 0755 /app/entrypoint.sh

ENV ASPNETCORE_URLS=http://0.0.0.0:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    ConnectionStrings__DefaultConnection="Host=/var/run/postgresql;Username=postgres;Database=cycling_performance_assistant" \
    PGDATA=/var/lib/postgresql/data \
    POSTGRES_DB=cycling_performance_assistant

EXPOSE 8080

STOPSIGNAL SIGTERM
ENTRYPOINT ["/app/entrypoint.sh"]
