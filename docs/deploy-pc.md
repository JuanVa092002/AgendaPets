# Deploy en el PC

`.github/workflows/deploy-pc.yml` prepara el deploy del backend despues de CI. Hoy no despliega.

## Cuando se dispara

`workflow_run` arranca cuando termina el workflow cuyo nombre es `CI`. Solo sigue si se cumplen las tres condiciones:

- `conclusion` es `success`. Un fallo, una cancelacion u otro estado no despliega.
- `head_branch` es `main`.
- `head_repository.full_name` es este repositorio. Un workflow de otro repo no entra.

No usa `pull_request_target`. No corre por un pull request cuya rama no sea `main`.

## Runner y concurrencia

El job `deploy` esta declarado para `self-hosted`, `linux`, `x64` y `agenda-pets-pc`. El grupo `agendapets-production-pc` tiene `cancel-in-progress: false`: no corta un deploy ya empezado. Como mucho queda otra ejecucion en espera.

El checkout del job de validacion usa `github.event.workflow_run.head_sha` y `fetch-depth: 1`. No hace `git pull` ni `git reset` del repo persistente del PC.

Permisos: `contents: read`. No hay secretos de GitHub. No se escribe con `GITHUB_TOKEN`.

## Por que el deploy no esta activo

El runner vive en `actions-runner/` de este repo. GitHub Actions haria el checkout en su workspace temporal, no en `~/proovian/apps/AgendaPets`.

`scripts/deploy-production.sh` toma la raiz con `git rev-parse --show-toplevel` de ese checkout. Compose lee `apps/server/.env.production` al lado del archivo Compose. Ese archivo esta en `.gitignore` y solo existe en la copia persistente del PC. El workspace de Actions no lo tendria.

Ejecutar el script ahi fallaria al armar el contenedor, o peor, lo levantaria sin la configuracion de produccion. No se copia, no se imprime y no se sustituye ese archivo con secretos de GitHub.

`GITHUB_WORKSPACE` es el checkout temporal de Actions, dentro de `actions-runner/_work/`. No es `~/proovian/apps/AgendaPets` y no trae `.env.production`, porque ese archivo no se versiona.

El puente futuro es `scripts/deploy-from-worktree.sh`. Acepta solo un SHA completo de 40 caracteres hexadecimales y lo pasa a minusculas. No usa ramas, tags ni el commit del checkout principal como sustituto.

Primero busca ese commit en el repositorio local. Si ya esta, no hace fetch. Si falta, ejecuta unicamente:

```bash
git fetch --no-tags origin <SHA>:refs/deploy/agendapets/<SHA>
```

Ese refspec no actualiza `main` ni `origin/main`. No usa `--force`, no usa `+` y no usa `--prune`. No hace pull, reset, checkout ni clean. Si el fetch falla, imprime `FETCH_FAILED` y no crea el worktree. El ref `refs/deploy/agendapets/<SHA>` se conserva. No se copian secretos a GitHub.

Despues crea un worktree separado en `/home/juanc/proovian/deploy/agendapets/<SHA>` con `git worktree add --detach`. No mueve `HEAD` ni los archivos del checkout principal.

Antes de copiar nada comprueba que esa ruta no exista. Si existe, se detiene y pide revision manual. No usa `git worktree remove --force` ni `rm -rf`.

Copia el `.env.production` del checkout principal al worktree con `install -m 600`. No lo imprime, no lo sube a GitHub y no lo copia de vuelta. Si el archivo de origen no existe, no despliega. Dentro del worktree, `git rev-parse HEAD` tiene que ser exactamente ese SHA. Si no coincide, no copia el entorno y no llama a Docker.

El candado es `/tmp/agendapets-worktree-deploy.lock`. Un segundo puente sale sin tocar Git ni Docker. El `flock` de `scripts/deploy-production.sh` sigue evitando dos recreaciones de `api`.

Al salir, el script borra solo `apps/server/target` dentro del worktree, si esa ruta es un directorio real y no un enlace. No usa `rm -rf` ni `git clean`. La copia de `.env.production` se queda hasta que `git worktree remove`, sin `--force`, retira el worktree entero. En Git 2.53 los archivos ignorados no impiden ese retiro. Si `target` no se puede borrar con esas comprobaciones, no se fuerza nada e imprime `WORKTREE_MANUAL_REVIEW`. El `.env.production` del checkout principal no se toca.

El job `deploy` sigue con `if: false`. Este puente no esta conectado al workflow. El primer deploy real sigue requiriendo aprobacion. No hay un Environment de GitHub y esta fase no lo crea.

## Que no hace este workflow

- No toca `proovian-cloudflared-edge`.
- No participa Render.
- No participa el Worker de failover.
- El rollback, cuando el script se ejecute a mano o en el futuro, sigue siendo el de `scripts/deploy-production.sh`.
- No uses `docker compose down`, `docker rm` ni `docker system prune`.

## Runner

`actions-runner/run.sh` escucha jobs. No lo cierres mientras haya una ejecucion. Si el PC esta apagado, el runner queda offline y el job no corre. Si aparece offline con el PC encendido, vuelve a lanzar `./run.sh` desde `actions-runner/` solo cuando no haya un job en curso. Esta fase no instala el runner como servicio.

Si un deploy futuro falla, el script intenta volver a la imagen etiquetada `agendapets-api:rollback-*`. No borres contenedores a mano para "arreglarlo".
