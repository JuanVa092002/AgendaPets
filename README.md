# AgendaPets

AgendaPets es un monorepo.

## Estructura

- `apps/client`: frontend web estático.
- `apps/server`: backend Spring Boot.
- `docs`: documentación del proyecto.
- `infra`: infraestructura específica del repositorio, si aplica.

## Despliegue

- Frontend: Vercel o Cloudflare Pages.
- Backend: Docker sobre WSL2, publicado mediante Cloudflare Tunnel.
- PostgreSQL: actualmente administrado externamente.

## Secretos

Los secretos se configuran mediante variables de entorno.
El repositorio no debe contener contraseñas, claves JWT ni tokens.

## Repositorio

https://github.com/JuanVa092002/AgendaPets
