#!/bin/sh
set -eu

if [ "${1:-}" = "api" ]; then
    attempt=0
    until pg_isready -h /var/run/postgresql -U postgres -d postgres; do
        attempt=$((attempt + 1))
        if [ "$attempt" -ge 60 ]; then
            echo "PostgreSQL did not become ready within 60 seconds." >&2
            exit 1
        fi
        sleep 1
    done

    if [ "$(psql -h /var/run/postgresql -U postgres -d postgres -tAc \
        "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'")" != "1" ]; then
        createdb -h /var/run/postgresql -U postgres "$POSTGRES_DB"
    fi

    exec dotnet /app/CyclingPerformanceAssistant.Api.dll
fi

if [ ! -s "$PGDATA/PG_VERSION" ]; then
    mkdir -p "$PGDATA"
    chown postgres:postgres "$PGDATA"
    runuser -u postgres -- /usr/lib/postgresql/16/bin/initdb \
        -D "$PGDATA" \
        --auth-local=trust \
        --auth-host=reject
fi

mkdir -p /var/run/postgresql
chown postgres:postgres /var/run/postgresql
chmod 0777 /var/run/postgresql

exec /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
