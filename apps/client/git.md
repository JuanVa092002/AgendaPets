# Guía Git para trabajo en equipo

Guía práctica para personas que están aprendiendo Git y necesitan usarlo en proyectos reales, como **lab-blog**.

---

## Antes de empezar (solo una vez)

### 1. Configura tu identidad

Git necesita saber quién eres en cada commit:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-correo@ejemplo.com"
```

Usa el **mismo correo** de tu cuenta de GitHub.

### 2. Clona el repositorio

```bash
git clone https://github.com/iTzJulians/lab-blog.git
cd lab-blog
```

### 3. Verifica en qué rama estás

```bash
git branch
```

La rama activa tiene un `*` al lado. En equipo, **no trabajes directo en `main`** salvo que el líder del grupo lo indique.

---

## Reglas de oro en equipo

1. **`main` es la rama estable** → lo que ya funciona y se puede mostrar.
2. **Cada persona trabaja en su rama** → `Juan`, `Nataly`, `ramapaula`, etc.
3. **Antes de subir cambios, baja los últimos** → `git pull`.
4. **Commits pequeños y claros** → un cambio lógico por commit.
5. **No subas archivos secretos** → nunca `.env`, contraseñas ni tokens.
6. **Haz commits desde la terminal** si usas Cursor → evita que aparezca `cursoragent` como contribuidor.
7. **No hagas `git push --force` en `main`** sin avisar al equipo.

---

## Escenario 1: Empezar una tarea nueva (crear tu rama)

**Situación:** Te asignaron la página de contacto y vas a trabajar tú solo en eso.

```bash
# 1. Asegúrate de tener lo último de main
git checkout main
git pull origin main

# 2. Crea tu rama (usa tu nombre o la tarea)
git checkout -b ramapaula

# 3. Confirma que estás en tu rama
git branch
```

**Buena práctica:** nombra la rama en minúsculas, sin espacios. Ejemplos: `juan`, `nataly-menu`, `footer-camilo`.

---

## Escenario 2: Guardar tu avance (commit)

**Situación:** Terminaste una parte del trabajo y quieres guardar un punto de control.

```bash
# 1. Mira qué cambió
git status
git diff

# 2. Agrega solo lo que corresponde a esta tarea
git add contacto.html css/contacto.css

# 3. Commit con mensaje claro
git commit -m "feat: agregar formulario de contacto"
```

### Mensajes de commit recomendados

| Prefijo | Cuándo usarlo | Ejemplo |
|---------|----------------|---------|
| `feat:` | Nueva funcionalidad | `feat: agregar footer en las 3 páginas` |
| `fix:` | Corrección de error | `fix: corregir menú en móvil` |
| `style:` | Solo diseño/CSS | `style: unificar colores del sitio` |
| `docs:` | Documentación | `docs: actualizar README` |
| `merge:` | Integrar rama de un compañero | `merge: integrar trabajo de Nataly` |

**Buena práctica:** el mensaje explica el **por qué** o **qué**, no solo "cambios" o "arreglos".

---

## Escenario 3: Subir tu rama a GitHub (primer push)

**Situación:** Es la primera vez que subes tu rama al remoto.

```bash
git push -u origin ramapaula
```

El `-u` deja configurado el seguimiento. La próxima vez bastará con:

```bash
git push
```

---

## Escenario 4: Actualizar tu rama con los últimos cambios de `main`

**Situación:** Tus compañeros ya subieron cosas a `main` y tú sigues en tu rama. Quieres evitar conflictos grandes después.

### Opción A — Merge (más común para principiantes)

```bash
git checkout ramapaula
git fetch origin
git merge origin/main
```

Si no hay conflictos, listo. Si los hay, ve al **Escenario 8**.

### Opción B — Pull en `main` y luego volver a tu rama

```bash
git checkout main
git pull origin main
git checkout ramapaula
git merge main
```

**Buena práctica:** haz esto **antes** de abrir un Pull Request o antes de integrar tu trabajo.

---

## Escenario 5: Subir cambios cuando ya trabajas en tu rama

**Situación:** Ya hiciste commit y quieres publicar tu avance.

```bash
# 1. Baja cambios nuevos del remoto (por si alguien tocó tu misma rama)
git pull origin ramapaula

# 2. Sube tus commits
git push origin ramapaula
```

**Flujo recomendado cada día:**

```bash
git pull origin main      # o merge main en tu rama
git add .
git commit -m "feat: ..."
git push
```

---

## Escenario 6: Integrar el trabajo de un compañero a `main`

**Situación:** Paula terminó su parte y el equipo quiere unirla a la rama principal.

### Si usan Pull Request (recomendado)

1. Paula hace `git push origin ramapaula`
2. En GitHub: **Compare & pull request**
3. Revisan el código
4. Hacen **Merge pull request**

### Si lo hacen por terminal (como en el laboratorio)

```bash
git checkout main
git pull origin main
git fetch origin
git merge origin/ramapaula -m "merge: integrar trabajo de Paula"
git push origin main
```

**Buena práctica:** solo una persona integra a `main` por tarea, para no pisarse.

---

## Escenario 7: Ver ramas del equipo

**Situación:** Quieres saber qué ramas existen en GitHub.

```bash
git fetch origin
git branch -a
```

Para traer una rama remota a tu PC:

```bash
git branch --track Nataly origin/Nataly
git checkout Nataly
```

---

## Escenario 8: Resolver conflictos de merge

**Situación:** Git dice `CONFLICT` al hacer merge.

```bash
git status
```

Verás archivos en **Unmerged paths**. Abre esos archivos y busca:

```text
<<<<<<< HEAD
(tu código o el de main)
=======
(código de la otra rama)
>>>>>>> nombre-rama
```

### Pasos

1. Edita el archivo y deja **una sola versión correcta**
2. Borra las marcas `<<<<<<<`, `=======`, `>>>>>>>`
3. Guarda el archivo
4. Márcalo como resuelto:

```bash
git add archivo-resuelto.html
```

5. Termina el merge:

```bash
git commit -m "merge: integrar trabajo de Camilo"
```

**Buena práctica:** si no sabes qué versión dejar, **pregunta al compañero** antes de borrar su código.

---

## Escenario 9: Cambiaste de rama y Git no te deja

**Situación:** Tienes cambios sin guardar y quieres cambiar de rama.

### Opción A — Guardar en commit

```bash
git add .
git commit -m "wip: avance temporal"
git checkout main
```

### Opción B — Guardar temporalmente (stash)

```bash
git stash
git checkout main
# cuando vuelvas a tu rama:
git checkout ramapaula
git stash pop
```

`wip` = *work in progress* (trabajo en progreso).

---

## Escenario 10: Deshacer errores comunes

### Quitaste algo del staging (antes del commit)

```bash
git restore --staged archivo.html
```

### Descartar cambios locales en un archivo (cuidado: se pierden)

```bash
git restore archivo.html
```

### Corregir el último commit (aún no hiciste push)

```bash
git commit --amend -m "feat: mensaje corregido"
```

### Ver historial reciente

```bash
git log --oneline -10
```

**Buena práctica:** si **ya hiciste push**, no uses `--amend` sin coordinarlo con el equipo.

---

## Escenario 11: Trabajar sin romper el menú del compañero

En **lab-blog**, el menú vive en:

- `css/navigation.css`
- Bloque HTML entre `<!-- INICIO DEL MENÚ -->` y `<!-- FIN DEL MENÚ -->`

**Regla del proyecto:**

- No edites el menú si no es tu tarea
- Agrega tu contenido **debajo** de `<!-- EQUIPO: empiecen acá ↓ -->`
- Usa tu propio CSS (`css/contacto.css`, `css/quienes-somos.css`, etc.)

---

## Escenario 12: Evitar que Cursor aparezca como contribuidor

**Situación:** Hiciste commit desde Cursor y aparece `cursoragent` en GitHub.

### Prevención

1. Cursor Settings → Agents → Attribution → **desactivar**
2. Commits desde terminal:

```bash
git add .
git commit -m "feat: mi cambio"
git push
```

### Si ya pasó

Revisa el mensaje del último commit:

```bash
git log -1 --format='%B'
```

Si ves `Co-authored-by: Cursor`, corrígelo **antes** de hacer push.

---

## Checklist rápido antes de entregar

- [ ] Estoy en **mi rama**, no en `main` (salvo integración)
- [ ] Hice `git pull` / merge con `main` reciente
- [ ] Probé la página en el navegador
- [ ] No hay archivos basura ni secretos en `git status`
- [ ] El mensaje del commit es claro
- [ ] Hice `git push`
- [ ] Avisé al equipo en el chat si integré a `main`

---

## Comandos que SÍ usarás mucho

```bash
git status
git branch
git checkout nombre-rama
git pull origin main
git add .
git commit -m "feat: descripción"
git push origin nombre-rama
git fetch origin
git merge origin/main
git log --oneline -5
```

---

## Comandos que evitar al principio

| Comando | Por qué evitarlo |
|---------|------------------|
| `git push --force` en `main` | Puede borrar el trabajo de otros |
| `git reset --hard` | Borra cambios sin recuperación fácil |
| `git commit -m "cambios"` | Mensaje inútil para el equipo |
| Trabajar todos en `main` | Conflictos constantes |

---

## Flujo ideal del equipo (resumen)

```text
main (estable)
  │
  ├── rama Juan        → menú / inicio
  ├── rama Nataly      → quiénes somos
  ├── rama ramapaula   → contacto
  └── rama ramacamilo  → footer
```

1. Cada quien trabaja en su rama
2. Hace commits frecuentes
3. Actualiza con `main` antes de integrar
4. Una persona hace merge a `main`
5. Todos hacen `git pull origin main` para sincronizarse

---

## Ayuda rápida si algo sale mal

| Problema | Qué hacer |
|----------|-----------|
| `src refspec man does not match any` | Revisaste mal el nombre: es `main`, no `man` |
| `Please commit your changes or stash` | Haz commit o `git stash` antes de cambiar de rama |
| `CONFLICT` en merge | Resuelve archivos, `git add`, `git commit` |
| `Your branch is behind` | `git pull origin main` |
| `failed to push` | Primero `git pull`, resuelve conflictos, luego `git push` |

---

> **Tip final:** Git no se domina memorizando 50 comandos. Se domina con un flujo repetido: **rama → cambio → commit → pull → push → merge**.
