# Runner self-hosted de AgendaPets

Esta fase solo documenta la instalacion. No registra el runner, no lo arranca y no crea un workflow de deploy.

## Donde vive

El runner se instala en el Ubuntu local de este PC, con el usuario `juanc`. No se instala como root.

Es un runner de un solo repositorio: `~/proovian/apps/AgendaPets`. No es un runner de organizacion.

Arquitectura del host: `x86_64`. En GitHub Actions eso corresponde a `linux` y `x64`.

## Que podra hacer mas adelante

El usuario `juanc` ya esta en el grupo `docker`, asi que el runner tendra acceso indirecto al daemon de Docker Desktop. No recibe secretos del repositorio. `apps/server/.env.production` permanece solo en el PC y el script de deploy no lo imprime.

Cuando exista un workflow, ejecutara el script manual:

```bash
bash scripts/deploy-production.sh --dry-run
```

El deploy real, `bash scripts/deploy-production.sh`, queda para una aprobacion aparte. Ese script recrea solo el servicio `api` del proyecto Compose `server`. No toca `proovian-cloudflared-edge`. No usa `docker compose down`, `docker rm` ni `docker system prune`.

El runner no guarda el token de registro en el repositorio. GitHub muestra la URL del paquete segun el sistema y la arquitectura. Ese token es temporal. No se pega en el chat, ni en un archivo versionado, ni en este documento. Solo se escribe en el terminal local cuando `config.sh` lo pide.

## Etiquetas

El registro futuro usara la etiqueta `agenda-pets-pc`. El workflow, cuando se apruebe, pedira:

```yaml
runs-on: [self-hosted, linux, x64, agenda-pets-pc]
```

Ese workflow no se crea en esta fase. No existe `.github/workflows/deploy-pc.yml`.

## Disponibilidad

El runner solo ejecuta jobs mientras el PC esta encendido y el proceso del runner esta activo. Si el PC esta apagado, el deploy no corre.

Dejarlo encendido como servicio de usuario (`systemd --user`) es una aprobacion separada. En esta fase no se configura ese servicio. Antes de apagar el PC, el proceso del runner se detiene, salvo que mas adelante se apruebe el servicio.

## Comandos de una fase posterior

No ejecutarlos ahora. Sustituir los placeholders por lo que muestre GitHub en el momento del registro. El token solo va en el terminal.

```bash
cd ~/proovian/apps/AgendaPets
mkdir actions-runner
cd actions-runner
curl -o actions-runner.tar.gz <URL_GENERADA_POR_GITHUB>
tar xzf actions-runner.tar.gz
./config.sh --url <URL_DEL_REPOSITORIO> --token <TOKEN_TEMPORAL>
```

## Validacion posterior

Despues de aprobar la instalacion, y solo entonces:

```bash
./run.sh
```

`./run.sh` no se ejecuta en esta fase.
