#!/usr/bin/env bash
# Deploy manual de AgendaPets. No toca el tunel de Cloudflare.
set -Eeuo pipefail

LOCK_FILE="${AGENDA_DEPLOY_LOCK:-/tmp/agendapets-deploy.lock}"
if [[ "${DEPLOY_LOCK_HELD:-}" != "1" ]]; then
  exec flock -n "$LOCK_FILE" env DEPLOY_LOCK_HELD=1 bash "$0" "$@"
fi

DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=1
fi

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

COMPOSE=(docker compose -p server -f "$ROOT/apps/server/compose.prod.yml")
CONTAINER="agendapets-api"
IMAGE="agendapets-api:prod-local"
PUBLIC_HEALTH="https://api-agendapets.proovian.dpdns.org/health"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
COMMIT="$(git rev-parse --short HEAD)"
ROLLBACK_TAG="agendapets-api:rollback-${COMMIT}-${STAMP}"
DEPLOY_STARTED=0
ROLLBACK_IMAGE=""

log() {
  printf '%s\n' "$*"
}

run() {
  if [[ "$DRY_RUN" == "1" ]]; then
    printf 'DRY_RUN'
    printf ' %q' "$@"
    printf '\n'
    return 0
  fi
  "$@"
}

safe_logs() {
  if [[ "$DRY_RUN" == "1" ]]; then
    log "DRY_RUN docker logs --tail 80 ${CONTAINER}"
    return 0
  fi
  docker logs --tail 80 "$CONTAINER" 2>&1 \
    | sed -E \
      -e 's#(://)[^/@[:space:]]+:[^/@[:space:]]+@#\1REDACTED@#g' \
      -e 's#(PASSWORD|JWT_SECRET|TOKEN)=[^[:space:]]+#\1=REDACTED#Ig' \
    || true
}

restore_previous() {
  if [[ "$DRY_RUN" == "1" ]]; then
    log "DRY_RUN restauraria ${ROLLBACK_TAG} como ${IMAGE}"
    return 0
  fi
  if [[ -z "$ROLLBACK_IMAGE" ]]; then
    log "ROLLBACK_SKIPPED no habia imagen anterior"
    return 0
  fi
  log "ROLLBACK_START ${ROLLBACK_TAG}"
  docker tag "$ROLLBACK_TAG" "$IMAGE"
  "${COMPOSE[@]}" up -d --no-deps --no-build --force-recreate api
  log "ROLLBACK_ISSUED"
}

on_error() {
  local code=$?
  log "DEPLOY_FAILED exit=${code}"
  if [[ "$DEPLOY_STARTED" == "1" ]]; then
    restore_previous || log "ROLLBACK_FAILED"
  fi
  safe_logs
  exit "$code"
}
trap on_error ERR

log "ROOT ${ROOT}"
if [[ "$DRY_RUN" == "1" ]]; then
  log "DRY_RUN bash ./mvnw -B test (apps/server)"
else
  ( cd "$ROOT/apps/server" && bash ./mvnw -B test )
fi
run "${COMPOSE[@]}" config -q

if [[ "$DRY_RUN" == "1" ]]; then
  log "DRY_RUN etiquetaria la imagen actual de ${CONTAINER} como ${ROLLBACK_TAG}"
else
  if docker inspect "$CONTAINER" >/dev/null 2>&1; then
    ROLLBACK_IMAGE="$(docker inspect --format '{{.Image}}' "$CONTAINER")"
    docker tag "$ROLLBACK_IMAGE" "$ROLLBACK_TAG"
    log "ROLLBACK_TAG ${ROLLBACK_TAG}"
  else
    log "ROLLBACK_SKIPPED contenedor ${CONTAINER} no existe"
  fi
fi

DEPLOY_STARTED=1
run "${COMPOSE[@]}" up -d --build --no-deps api

if [[ "$DRY_RUN" == "1" ]]; then
  log "DRY_RUN esperaria healthy y ${PUBLIC_HEALTH}"
  log "DEPLOY_SUCCESS"
  exit 0
fi

deadline=$((SECONDS + 90))
healthy=0
while (( SECONDS < deadline )); do
  status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$CONTAINER" 2>/dev/null || echo missing)"
  if [[ "$status" == "healthy" ]]; then
    healthy=1
    break
  fi
  sleep 3
done

if [[ "$healthy" != "1" ]]; then
  log "LOCAL_HEALTH_FAILED"
  false
fi

curl --fail --silent --show-error --max-time 20 "$PUBLIC_HEALTH" >/dev/null
log "DEPLOY_SUCCESS"
log "ROLLBACK_AVAILABLE ${ROLLBACK_TAG}"
