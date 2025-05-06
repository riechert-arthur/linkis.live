set -euxo pipefail

#!/usr/bin/env bash
set -euxo pipefail

# Host & creds
: "${MYSQL_HOST:=mysql-test}"
: "${MYSQL_USER:=root}"
: "${MYSQL_ROOT_PASSWORD:?need MYSQL_ROOT_PASSWORD}"  # fail if unset

# Database: use TEST_DB if provided, else fallback to MYSQL_DATABASE
: "${TEST_DB:?need TEST_DB}"            # fail if unset

# Build mysql client command
export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"
MYSQL_CMD="mysql -h${MYSQL_HOST} -u${MYSQL_USER} ${TEST_DB}"

echo "⏳ Seeding test database…"
$MYSQL_CMD < /tests/01_seed_test_data.sql

echo "🧪 Running stored‐procedure tests by category…"
for sql in /tests/procs/*.sql; do
  echo "→ $(basename "$sql")"
  $MYSQL_CMD < "$sql"
done

echo "✅ All tests passed!"

