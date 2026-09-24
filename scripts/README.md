# Deploy de AgendaPets

El deploy de produccion es manual. El tunel `proovian-cloudflared-edge` no se reinicia.

Desde cualquier directorio:

```bash
~/proovian/apps/AgendaPets/scripts/deploy-production.sh
```

Comprueba los pasos sin construir ni recrear el contenedor:

```bash
~/proovian/apps/AgendaPets/scripts/deploy-production.sh --dry-run
```

El script corre los tests de `apps/server`, valida el Compose del proyecto `server`, etiqueta la imagen actual de `agendapets-api` como `agendapets-api:rollback-<commit>-<timestamp>` y luego ejecuta:

```bash
docker compose -p server -f apps/server/compose.prod.yml up -d --build --no-deps api
```

Espera hasta 90 segundos a que `agendapets-api` este `healthy` en Docker y despues pide `https://api-agendapets.proovian.dpdns.org/health`. El health local del contenedor es `http://127.0.0.1:8080/health`.

Si el health local o el publico fallan despues de recrear la API, el script vuelve a etiquetar la imagen anterior como `agendapets-api:prod-local` y ejecuta, solo sobre `api`:

```bash
docker compose -p server -f apps/server/compose.prod.yml up -d --no-deps --no-build --force-recreate api
```

Si `agendapets-api` no existia, imprime `ROLLBACK_SKIPPED` y no inventa una imagen. Un segundo deploy al mismo tiempo sale enseguida por `flock` en `/tmp/agendapets-deploy.lock`.

El primer deploy real no se ejecuta solo. Hay que lanzarlo a proposito, con aprobacion:

```bash
bash scripts/deploy-production.sh
```

Eso puede recrear `agendapets-api`. No reinicia `proovian-cloudflared-edge`. No forma parte de Render ni del Worker de Cloudflare. No lee ni administra secretos, y no imprime `.env.production` ni `cloudflared.env`.
