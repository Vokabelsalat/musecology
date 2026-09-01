#!/usr/bin/env bash

set -Eeuo pipefail

readonly REPOSITORY_DIR="/opt/musecology/repository"
readonly FRONTEND_DIR="${REPOSITORY_DIR}"
readonly APP_USER="musecology"
readonly BRANCH="master"
readonly SERVICE="musecology-frontend"
readonly HEALTH_URL="http://127.0.0.1:3050/"
readonly LOCK_FILE="/run/lock/musecology-frontend-deploy.lock"

exec 9>"${LOCK_FILE}"
if ! flock --nonblock 9; then
  echo "Another Musecology deployment is already running." >&2
  exit 1
fi

run_as_app() {
  runuser --user "${APP_USER}" -- "$@"
}

echo "Updating ${BRANCH} in ${REPOSITORY_DIR}..."
run_as_app git -C "${REPOSITORY_DIR}" pull --ff-only origin "${BRANCH}"

echo "Installing the locked frontend dependencies..."
run_as_app npm --prefix "${FRONTEND_DIR}" ci --no-audit --no-fund

echo "Building the frontend..."
run_as_app npm --prefix "${FRONTEND_DIR}" run build

echo "Restarting ${SERVICE}..."
systemctl restart "${SERVICE}"

for attempt in {1..15}; do
  if curl --fail --silent --show-error --head "${HEALTH_URL}" >/dev/null; then
    echo "Deployment completed successfully."
    systemctl --no-pager --full status "${SERVICE}"
    exit 0
  fi

  sleep 1
done

echo "The service did not pass its health check after the restart." >&2
journalctl --unit "${SERVICE}" --lines 50 --no-pager >&2
exit 1
