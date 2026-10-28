#!/bin/bash
set -euo pipefail

# Run from the deploy folder. Dumps the database and deletes backups older than 90 days.
# The deploy runs it before each production deploy. The weekly crontab line on the VPS:
#
#   30 2 * * 0 cd /home/james/portfolio/prod && ./backup.sh >> ~/backups/cron.log 2>&1

if [ ! -f .env ]; then
  echo "Error: .env file not found"
  exit 1
fi

# Only APP_NAME is needed, so the rest of .env (the secrets) stays out of the environment
APP_NAME=$(grep '^APP_NAME=' .env | cut -d= -f2- || true)
if [ -z "$APP_NAME" ]; then
  echo "Error: APP_NAME not set in .env"
  exit 1
fi

BACKUP_DIR="${HOME}/backups/${APP_NAME}"
DATABASE_CONTAINER="${APP_NAME}-db-1"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# The first deploy runs this before the database exists
if [ "$(docker inspect --format '{{.State.Running}}' "$DATABASE_CONTAINER" 2>/dev/null)" = "true" ]; then
  echo "Backing up the database from ${DATABASE_CONTAINER}..."
  # The dump goes to a .partial file first, so a failed dump never looks like a good backup
  docker exec "$DATABASE_CONTAINER" pg_dump -U portfolio -d portfolio > "$BACKUP_DIR/db-${TIMESTAMP}.sql.partial"
  mv "$BACKUP_DIR/db-${TIMESTAMP}.sql.partial" "$BACKUP_DIR/db-${TIMESTAMP}.sql"
  echo "Database backup completed."
else
  echo "The database isn't running, so there's nothing to dump."
fi

find "$BACKUP_DIR" -name "db-*.sql" -type f -mtime +90 -delete

echo "Backup created at $(date), old backups deleted." >> "$BACKUP_DIR/backup.log"
