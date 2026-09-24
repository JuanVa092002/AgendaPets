#!/usr/bin/env bash
# Puente de deploy. No mueve el checkout principal ni el tunel.
set -Eeuo pipefail

MAIN="/home/juanc/proovian/apps/AgendaPets"
BASE="/home/juanc/proovian/deploy/agendapets"
SOURCE_ENV="${MAIN}/apps/server/.env.production"
LOCK_FILE="/tmp/agendapets-worktree-deploy.lock"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "Otro puente de worktree esta en curso." >&2
  exit 1
fi

DRY_RUN=0
SHA_RAW=""
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=1
  SHA_RAW="${2:-}"
  if [[ -n "${3:-}" ]]; then
    echo "Argumentos de mas." >&2
    exit 1
  fi
else
  SHA_RAW="${1:-}"
  if [[ -n "${2:-}" ]]; then
    echo "Argumentos de mas." >&2
    exit 1
  fi
fi

if [[ ! "$SHA_RAW" =~ ^[0-9a-fA-F]{40}$ ]]; then
  echo "SHA invalido. Se esperan 40 caracteres hexadecimales." >&2
  exit 1
fi
SHA="$(printf '%s' "$SHA_RAW" | tr '[:upper:]' '[:lower:]')"
WORKTREE="${BASE}/${SHA}"
DEST_ENV="${WORKTREE}/apps/server/.env.production"
CREATED=0

worktree_es_de_este_script() {
  [[ "$WORKTREE" == "${BASE}/${SHA}" ]] || return 1
  [[ -d "$WORKTREE" && ! -L "$WORKTREE" ]] || return 1
  local real
  real="$(readlink -f "$WORKTREE")"
  [[ "$real" == "$WORKTREE" ]] || return 1
  git -C "$MAIN" worktree list --porcelain | grep -qxF "worktree ${WORKTREE}"
}

quitar_target_de_maven() {
  local target real
  target="${WORKTREE}/apps/server/target"
  worktree_es_de_este_script || return 1
  [[ -e "$target" ]] || return 0
  if [[ -L "$target" || ! -d "$target" ]]; then
    echo "TARGET_NO_ES_DIRECTORIO ${target}" >&2
    return 1
  fi
  real="$(readlink -f "$target")"
  [[ "$real" == "$target" ]] || return 1
  find "$target" -xdev -P -depth \( -type f -o -type l \) -exec rm -f -- {} + || return 1
  find "$target" -xdev -P -depth -type d -exec rmdir -- {} + || return 1
  [[ ! -e "$target" ]]
}

cleanup() {
  local code=$?
  trap - EXIT
  if [[ "$DRY_RUN" == "1" || "$CREATED" != "1" ]]; then
    exit "$code"
  fi
  if ! quitar_target_de_maven; then
    echo "WORKTREE_MANUAL_REVIEW ${WORKTREE}" >&2
    exit "$code"
  fi
  if ! git -C "$MAIN" worktree remove "$WORKTREE"; then
    echo "WORKTREE_MANUAL_REVIEW ${WORKTREE}" >&2
  fi
  exit "$code"
}
trap cleanup EXIT

log() {
  printf '%s\n' "$*"
}

asegurar_commit() {
  local got ref
  if git -C "$MAIN" cat-file -e "${SHA}^{commit}" 2>/dev/null; then
    if [[ "$DRY_RUN" == "1" ]]; then
      log "DRY_RUN commit presente en el repositorio local"
      log "DRY_RUN no haria fetch"
    fi
    return 0
  fi
  if [[ "$DRY_RUN" == "1" ]]; then
    log "DRY_RUN fetch --no-tags origin ${SHA}:refs/deploy/agendapets/${SHA}"
    return 0
  fi
  if ! git -C "$MAIN" fetch --no-tags origin "${SHA}:refs/deploy/agendapets/${SHA}" >/dev/null 2>&1; then
    echo "FETCH_FAILED sha=${SHA}" >&2
    exit 1
  fi
  got="$(git -C "$MAIN" rev-parse --verify "${SHA}^{commit}")"
  got="$(printf '%s' "$got" | tr '[:upper:]' '[:lower:]')"
  ref="$(git -C "$MAIN" rev-parse --verify "refs/deploy/agendapets/${SHA}^{commit}")"
  ref="$(printf '%s' "$ref" | tr '[:upper:]' '[:lower:]')"
  if [[ "$got" != "$SHA" || "$ref" != "$SHA" ]]; then
    echo "El commit obtenido no coincide con el SHA pedido." >&2
    exit 1
  fi
}

asegurar_commit

if [[ -e "$WORKTREE" ]]; then
  echo "WORKTREE_EXISTS ${WORKTREE} requiere revision manual." >&2
  exit 1
fi

if [[ ! -f "$SOURCE_ENV" || -L "$SOURCE_ENV" ]]; then
  echo "Falta el archivo local de produccion. No se despliega." >&2
  exit 1
fi

if [[ "$DRY_RUN" == "1" ]]; then
  log "DRY_RUN sha ${SHA}"
  log "DRY_RUN worktree ${WORKTREE}"
  log "DRY_RUN ref refs/deploy/agendapets/${SHA}"
  log "DRY_RUN env de origen presente"
  log "DRY_RUN crearia el worktree con git worktree add --detach"
  log "DRY_RUN copiaria el env con install -m 600"
  log "DRY_RUN ejecutaria bash scripts/deploy-production.sh"
  log "DRY_RUN borraria solo apps/server/target dentro del worktree"
  log "DRY_RUN retiraria el worktree sin --force"
  exit 0
fi

mkdir -p "$BASE"
git -C "$MAIN" worktree add --detach "$WORKTREE" "$SHA"
CREATED=1

got="$(git -C "$WORKTREE" rev-parse HEAD)"
got="$(printf '%s' "$got" | tr '[:upper:]' '[:lower:]')"
if [[ "$got" != "$SHA" ]]; then
  echo "El HEAD del worktree no coincide con el SHA pedido." >&2
  exit 1
fi

install -m 600 "$SOURCE_ENV" "$DEST_ENV"
if [[ ! -f "$DEST_ENV" || -L "$DEST_ENV" ]]; then
  echo "La copia del entorno no quedo como archivo regular." >&2
  exit 1
fi
mode="$(stat -c '%a' "$DEST_ENV")"
if [[ "$mode" != "600" ]]; then
  echo "La copia del entorno no quedo con permisos 600." >&2
  exit 1
fi

(
  cd "$WORKTREE"
  bash scripts/deploy-production.sh
)
