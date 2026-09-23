# Migración al monorepo

## Repositorios de origen

- Frontend original: https://github.com/AgendaPets/AgendaPets
- Backend original: https://github.com/AgendaPets/Backend_AgendaPets

## Destino

- Frontend: `apps/client`
- Backend: `apps/server`

## Procedimiento

- Se utilizó `git-filter-repo` para mover históricamente el frontend a `apps/client`.
- Se utilizó `git-filter-repo` para mover históricamente el backend a `apps/server`.
- Se utilizó `git merge --allow-unrelated-histories` para unir los historiales.
- El commit de integración es `3cd879e`.
- Los autores históricos se conservaron.

## Hooks locales

Los hooks locales están únicamente en `.git/hooks/`.
No están versionados y no se publican en GitHub.

## Repositorio oficial

https://github.com/JuanVa092002/AgendaPets
