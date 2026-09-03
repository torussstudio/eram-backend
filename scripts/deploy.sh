#!/bin/sh

set -eu

APP_NAME="eram-backend"
NETWORK="toruss-network"
ENV_FILE="/opt/toruss/projects/eram/backend/.env.production"

IMAGE="eram-backend:${GITHUB_SHA:-manual}"
NEW_CONTAINER="${APP_NAME}-new"
OLD_CONTAINER="${APP_NAME}"

HEALTH_URL="http://127.0.0.1:5000/health"

echo "=== ERAM BACKEND DEPLOYMENT ==="
echo "Image: ${IMAGE}"

cleanup_new() {
  echo "Cleaning up new container..."
  docker rm -f "$NEW_CONTAINER" >/dev/null 2>&1 || true
}

rollback() {
  echo "=== ROLLBACK ==="

  cleanup_new

  if docker ps -a --format '{{.Names}}' | grep -qx "$OLD_CONTAINER"; then
    if ! docker ps --format '{{.Names}}' | grep -qx "$OLD_CONTAINER"; then
      echo "Starting previous production container..."
      docker start "$OLD_CONTAINER"
    fi
  fi
}

trap 'rollback' INT TERM

echo
echo "=== BUILD NEW IMAGE ==="

docker build \
  --pull \
  -t "$IMAGE" \
  .

echo
echo "=== START NEW CONTAINER ==="

cleanup_new

docker run -d \
  --name "$NEW_CONTAINER" \
  --network "$NETWORK" \
  --env-file "$ENV_FILE" \
  --restart unless-stopped \
  "$IMAGE"

echo
echo "=== WAIT FOR HEALTH ==="

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
echo "=== STOP OLD CONTAINER ==="

docker stop "$OLD_CONTAINER"

echo
echo "=== REMOVE OLD CONTAINER ==="

docker rm "$OLD_CONTAINER"

echo
echo "=== PROMOTE NEW CONTAINER ==="

docker rename "$NEW_CONTAINER" "$APP_NAME"

echo
echo "=== VERIFY PRODUCTION ==="

sleep 3

if ! docker exec "$APP_NAME" sh -c \
  "wget -qO- $HEALTH_URL" >/dev/null 2>&1; then

  echo "ERROR: Promoted container failed health check."

  docker rm -f "$APP_NAME" || true

  exit 1
fi

echo
echo "=== DEPLOYMENT SUCCESSFUL ==="

docker ps --filter "name=$APP_NAME"

echo
echo "Health:"
docker exec "$APP_NAME" sh -c "wget -qO- $HEALTH_URL"

echo
echo "Image:"
docker inspect "$APP_NAME" --format '{{.Config.Image}}'
