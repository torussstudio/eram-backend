#!/bin/sh

set -eu

APP_NAME="eram-backend"
OLD_CONTAINER="${APP_NAME}-old"
NEW_CONTAINER="${APP_NAME}-new"

NETWORK="toruss-network"
ENV_FILE="/opt/toruss/projects/eram/backend/.env.production"

IMAGE="eram-backend:${GITHUB_SHA:-manual}"

HEALTH_URL="http://127.0.0.1:5000/health"

echo "========================================"
echo " ERAM BACKEND DEPLOYMENT"
echo "========================================"
echo "Image: ${IMAGE}"

cleanup_new() {
  docker rm -f "$NEW_CONTAINER" >/dev/null 2>&1 || true
}

cleanup_old() {
  docker rm -f "$OLD_CONTAINER" >/dev/null 2>&1 || true
}

rollback() {
  echo
  echo "========================================"
  echo " ROLLBACK"
  echo "========================================"

  cleanup_new

  if docker ps --format '{{.Names}}' | grep -qx "$APP_NAME"; then
    echo "Removing failed promoted container..."
    docker rm -f "$APP_NAME" >/dev/null 2>&1 || true
  fi

  if docker ps -a --format '{{.Names}}' | grep -qx "$OLD_CONTAINER"; then
    echo "Restoring previous production container..."
    docker rename "$OLD_CONTAINER" "$APP_NAME" 2>/dev/null || true
    docker start "$APP_NAME" >/dev/null 2>&1 || true
  fi

  echo "Rollback completed."
}

trap 'rollback' INT TERM

echo
echo "=== BUILD NEW IMAGE ==="

docker build \
  --pull \
  -t "$IMAGE" \
  .

echo
echo "=== CLEAN TEMPORARY CONTAINERS ==="

cleanup_new
cleanup_old

echo
echo "=== START NEW CONTAINER ==="

docker run -d \
  --name "$NEW_CONTAINER" \
  --network "$NETWORK" \
  --env-file "$ENV_FILE" \
  --restart unless-stopped \
  "$IMAGE"

echo
echo "=== WAIT FOR NEW CONTAINER HEALTH ==="

HEALTH_OK=0

for i in $(seq 1 30); do
  if docker exec "$NEW_CONTAINER" sh -c \
    "wget -qO- $HEALTH_URL" >/dev/null 2>&1; then
    HEALTH_OK=1
    break
  fi

  echo "Health check attempt $i/30..."
  sleep 2
done

if [ "$HEALTH_OK" -ne 1 ]; then
  echo "ERROR: New container failed health check."
  docker logs --tail 50 "$NEW_CONTAINER" || true
  cleanup_new
  exit 1
fi

echo "New container health check passed."

echo
echo "=== PRESERVE OLD CONTAINER ==="

docker stop "$APP_NAME"

docker rename "$APP_NAME" "$OLD_CONTAINER"

echo
echo "=== PROMOTE NEW CONTAINER ==="

docker rename "$NEW_CONTAINER" "$APP_NAME"

echo
echo "=== VERIFY PROMOTED CONTAINER ==="

sleep 3

if ! docker exec "$APP_NAME" sh -c \
  "wget -qO- $HEALTH_URL" >/dev/null 2>&1; then

  echo "ERROR: Promoted container failed health check."

  rollback
  exit 1
fi

echo "Promoted container health check passed."

echo
echo "=== REMOVE OLD CONTAINER ==="

cleanup_old

echo
echo "========================================"
echo " DEPLOYMENT SUCCESSFUL"
echo "========================================"

docker ps --filter "name=$APP_NAME"

echo
echo "Health:"
docker exec "$APP_NAME" sh -c "wget -qO- $HEALTH_URL"

echo
echo "Image:"
docker inspect "$APP_NAME" --format '{{.Config.Image}}'
