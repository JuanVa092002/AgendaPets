# Guía Git Colaborativo — Archivo maestro

> Para principiantes que trabajan en equipo (proyectos universitarios, bootcamps, páginas web, APIs, etc.).  
> **No memorices 50 comandos.** Busca tu situación, copia los pasos y listo.

---

## Índice rápido — ¿Qué quieres hacer?

| Si quieres… | Ve a |
|-------------|------|
| Configurar Git por primera vez | [Configuración inicial](#configuración-inicial-solo-una-vez) |
| Empezar a trabajar hoy | [Escenario 1](#escenario-1--empezar-a-trabajar-hoy) |
| Guardar y subir tu trabajo | [Escenario 2](#escenario-2--guardar-y-subir-tu-trabajo) |
| Llevar **tu** rama a `main` | [Escenario 3](#escenario-3--llevar-tu-rama-a-main) |
| Unir **todo el equipo** en `main` | [Escenario 4](#escenario-4--unir-todo-el-equipo-en-main) |
| Traer lo nuevo de `main` a tu rama | [Escenario 5](#escenario-5--traer-cambios-de-main-a-tu-rama) |
| Resolver un conflicto | [Escenario 6](#escenario-6--resolver-un-conflicto) |
| Git no me deja cambiar de rama | [Escenario 7](#escenario-7--git-no-me-deja-cambiar-de-rama) |
| Mi `push` fue rechazado | [Escenario 8](#escenario-8--mi-push-fue-rechazado) |
| Trabajé en `main` sin querer | [Escenario 9](#escenario-9--trabajé-en-main-sin-querer) |
| Ver ramas del equipo | [Escenario 10](#escenario-10--ver-ramas-del-equipo) |
| Clonar un proyecto existente | [Escenario 11](#escenario-11--clonar-un-proyecto-existente) |
| Crear mi rama por primera vez | [Escenario 12](#escenario-12--crear-mi-rama-la-primera-vez) |
| Trabajar sin pisar a otros | [Escenario 13](#escenario-13--trabajar-en-equipo-sin-pisarse) |
| Integrar con Pull Request | [Escenario 14](#escenario-14--integrar-con-pull-request) |
| Deshacer un error | [Escenario 15](#escenario-15--deshacer-errores-comunes) |
| Commits limpios (sin IA/Cursor) | [Escenario 16](#escenario-16--commits-limpios) |
| Crear el repo (líder del equipo) | [Guía del líder](#guía-del-líder-crear-el-repositorio) |

---

## Configuración inicial (solo una vez)

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-correo@ejemplo.com"
```

Usa el **mismo correo** de tu cuenta de GitHub/GitLab.

---

## 4 ideas que lo explican todo

```text
main          →  La versión oficial (lo que funciona y se puede mostrar)
tu-rama       →  Tu espacio de trabajo (donde haces cambios)
commit        →  Guardar un punto de control con mensaje
push / pull   →  Subir / bajar cambios al repositorio remoto
```

### Las 3 reglas de cualquier equipo

1. **Nadie trabaja directo en `main`** (salvo quien integra al final).
2. **Antes de trabajar:** actualiza tu rama con lo último de `main`.
3. **Cada quien toca solo su parte** → menos conflictos, menos estrés.

### Cómo se ve un proyecto en equipo (ejemplo genérico)

```text
main (estable)
  │
  ├── feat/navbar       → menú / header
  ├── feat/home         → página de inicio
  ├── feat/contacto     → formulario de contacto
  ├── feat/login        → autenticación
  └── feat/api-users    → endpoint de usuarios
```

Cada persona = **una rama + una tarea clara**.

---

## Comandos que vas a repetir siempre

| Comando | Qué hace |
|---------|----------|
| `git status` | ¿En qué rama estoy? ¿Qué cambié? |
| `git branch` | Lista mis ramas locales |
| `git switch main` | Ir a `main` |
| `git switch mi-rama` | Ir a tu rama |
| `git switch -c mi-rama` | Crear rama nueva e ir a ella |
| `git pull origin main` | Traer lo último de `main` a donde estás |
| `git add .` | Preparar cambios para commit |
| `git commit -m "mensaje"` | Guardar |
| `git push origin mi-rama` | Subir tu rama |
| `git merge mi-rama` | Unir una rama en la rama actual |

> `git switch` = `git checkout` (forma moderna). Si tu curso usa `checkout`, funciona igual.

---

## Escenario 1 — Empezar a trabajar hoy

**Situación:** Abres el proyecto y quieres seguir donde lo dejaste. Pasa **todos los días**.

```bash
cd mi-proyecto
git switch feat/mi-tarea
git pull origin main
git status
```

**Deberías ver:** `On branch feat/mi-tarea` y tus cambios pendientes (o `nothing to commit`).

**Ahora sí:** abre el editor y trabaja.

---

## Escenario 2 — Guardar y subir tu trabajo

**Situación:** Terminaste algo (o un avance) y quieres que quede en GitHub.

```bash
git status
git diff
git add archivo1.html archivo2.css
git commit -m "feat(contacto): add contact form validation"
git push origin feat/mi-tarea
```

### Conventional Commits — copia y adapta

| Tipo | Cuándo | Ejemplo |
|------|--------|---------|
| `feat` | Nueva función | `feat(login): add password reset` |
| `fix` | Corrección | `fix(navbar): fix mobile menu toggle` |
| `style` | Solo diseño/CSS | `style(home): update hero section colors` |
| `docs` | Documentación | `docs: update setup instructions` |
| `merge` | Integrar trabajo | `merge: integrate maria navbar` |

**Primer push de una rama nueva:**

```bash
git push -u origin feat/mi-tarea
```

Después, con `git push` basta.

---

## Escenario 3 — Llevar TU rama a `main`

**Situación:** Terminaste tu tarea y el equipo quiere integrarla a la rama oficial.

> **Importante:** mergeen **de uno en uno**. Si dos personas mergean a `main` al mismo tiempo, casi seguro habrá conflictos.

### Paso A — Dueño de la rama (tú)

```bash
git switch feat/mi-tarea
git pull origin main
git push origin feat/mi-tarea
```

Avisa en el chat del equipo: **"Listo para merge, rama feat/mi-tarea"**.

### Paso B — Quien integra (tú u otro compañero)

```bash
git switch main
git pull origin main
git merge feat/mi-tarea
git push origin main
```

Avisa: **"Merge listo, siguiente puede integrar"**.

### Paso C — Todos los demás (no lo saltes)

```bash
git switch feat/su-tarea
git pull origin main
```

Si no haces esto, mañana trabajarás con código viejo y tendrás conflictos más difíciles.

---

## Escenario 4 — Unir TODO el equipo en `main`

**Situación:** Son 4–5 personas y quieren que `main` tenga el trabajo de todos antes de una entrega.

### Antes de empezar — acuerden el orden

Ejemplo en una página web (de arriba hacia abajo):

```text
1. feat/navbar
2. feat/home
3. feat/contacto
4. feat/footer
```

En un backend:

```text
1. feat/database-setup
2. feat/auth
3. feat/api-users
```

### La persona que coordina repite esto por cada compañero:

```bash
git switch main
git pull origin main
git merge feat/navbar
git push origin main
# Avisar: "navbar integrado, siguiente"

git switch main
git pull origin main
git merge feat/home
git push origin main
# Avisar: "home integrado, siguiente"

# ... repetir con cada rama
```

### Después del último merge — TODOS hacen esto:

```bash
git switch mi-rama
git pull origin main
```

### Criterio de éxito

- `main` tiene el trabajo de todos
- La app corre sin errores obvios
- El historial muestra commits de varios integrantes

---

## Escenario 5 — Traer cambios de `main` a tu rama

**Situación:** Un compañero ya mergeó a `main` y tú sigues en tu rama. **Esto pasa constantemente en equipos.**

```bash
git switch feat/mi-tarea
git pull origin main
```

**Patrón que nunca cambia:**

```text
Alguien mergeó a main  →  yo hago: git pull origin main (desde MI rama)
```

### ¿Cuándo hacerlo?

- Al empezar el día
- Antes de hacer `push`
- Antes de pedir que mergeen tu rama
- Cada vez que alguien diga "ya integré a main"
- Antes de una demo o entrega

---

## Escenario 6 — Resolver un conflicto

**Situación:** Git dice `CONFLICT` al hacer merge o pull. **Normal en equipos.** No es el fin del mundo.

### Paso 1 — Mira qué archivos tienen conflicto

```bash
git status
```

Verás algo como `both modified: index.html`.

### Paso 2 — Abre el archivo y busca esto

```text
<<<<<<< HEAD
(tu código)
=======
(código de main o del compañero)
>>>>>>> main
```

### Paso 3 — Decide qué queda

| Caso | Qué hacer |
|------|-----------|
| Editaste cosas **diferentes** del compañero | Quédate con **ambas** partes |
| Los dos cambiaron **la misma línea** | Elige la versión correcta o combínalas |
| No sabes cuál es la correcta | **Pregunta al compañero** antes de borrar |

**Ejemplo web:** si uno hizo el navbar y otro el body en el mismo HTML, lo correcto suele ser:

```html
<header>...</header>   <!-- del compañero -->
<main>...</main>       <!-- tuyo -->
<footer>...</footer>   <!-- de otro -->
```

### Paso 4 — Termina el merge

```bash
# Borra las marcas <<<<<<< ======= >>>>>>>
git add index.html
git commit -m "merge: resolve conflict in index.html"
git push origin feat/mi-tarea
```

---

## Escenario 7 — Git no me deja cambiar de rama

**Situación:** Quieres cambiar de rama y Git dice:

```text
Please commit your changes or stash them before you switch branches
```

Significa: tienes cambios sin guardar.

### Opción A — Guardar en commit (recomendada)

```bash
git add .
git commit -m "wip: avance temporal"
git switch main
```

`wip` = *work in progress* (trabajo en progreso).

### Opción B — Guardar un momento sin commit

```bash
git stash
git switch main

# Cuando vuelvas a tu rama:
git switch feat/mi-tarea
git stash pop
```

---

## Escenario 8 — Mi `push` fue rechazado

**Situación:** Corres `git push` y Git lo rechaza. Muy común cuando el equipo trabaja en paralelo.

### Caso A — "Your branch is behind"

Alguien subió cambios a `main` antes que tú.

```bash
git pull origin main
# Si hay conflicto → Escenario 6
git push origin feat/mi-tarea
```

### Caso B — "Updates were rejected" en tu rama

```bash
git pull origin feat/mi-tarea
git push origin feat/mi-tarea
```

### Caso C — Nunca hagas esto en `main` sin avisar

```bash
git push --force origin main   # ❌ Puede borrar el trabajo de otros
```

---

## Escenario 9 — Trabajé en `main` sin querer

**Situación:** Empezaste a codear y te diste cuenta de que estás en `main`, no en tu rama. **Le pasa a muchos principiantes.**

### Si AÚN no hiciste commit

```bash
git switch -c feat/mi-tarea
```

Tus cambios se mueven a la rama nueva. Listo.

### Si YA hiciste commit en `main` (pero no hiciste push)

```bash
git branch feat/mi-tarea
git switch feat/mi-tarea
git switch main
git reset --hard HEAD~1
git switch feat/mi-tarea
```

> `HEAD~1` deshace el último commit en `main`. Solo hazlo si **no** hiciste push.

### Si YA hiciste push a `main`

**No arregles solo.** Avisa al equipo y pide ayuda antes de hacer cualquier cosa.

---

## Escenario 10 — Ver ramas del equipo

**Situación:** Quieres saber qué ramas existen o ver el trabajo de un compañero.

```bash
git fetch origin
git branch -a
```

### Ver el trabajo de alguien (solo mirar, sin tocar)

```bash
git fetch origin
git switch -c feat/navbar origin/feat/navbar
# para volver a la tuya:
git switch feat/mi-tarea
```

---

## Escenario 11 — Clonar un proyecto existente

**Situación:** Te uniste al equipo y ya existe el repositorio.

```bash
git clone https://github.com/usuario/mi-proyecto.git
cd mi-proyecto
git branch
```

Luego → [Escenario 12](#escenario-12--crear-mi-rama-la-primera-vez).

---

## Escenario 12 — Crear mi rama la primera vez

**Situación:** Ya tienes el proyecto clonado y necesitas tu rama de trabajo.

```bash
git switch main
git pull origin main
git switch -c feat/mi-tarea
git push -u origin feat/mi-tarea
git branch
```

### Nombres de rama — buenas y malas prácticas

| ✅ Bien | ❌ Mal |
|---------|--------|
| `feat/login` | `Login` |
| `rama-maria` | `rama maria` |
| `fix/navbar-mobile` | `arreglos` |
| `feat/api-users` | `mi rama final v2` |

---

## Escenario 13 — Trabajar en equipo sin pisarse

**Situación:** Varios editan el mismo proyecto y quieren evitar conflictos.

### Regla 1 — Divide el trabajo

| Mala idea | Buena idea |
|-----------|------------|
| "Todos editen `index.html`" | Cada quien su archivo o sección |
| Un solo `styles.css` para 5 personas | Un CSS por módulo/página |
| Nadie avisa qué está haciendo | Chat activo: "yo toco el navbar" |

### Regla 2 — Separa archivos cuando puedas

```text
css/navbar.css
css/home.css
css/contacto.css
pages/about.html
pages/contact.html
```

### Regla 3 — Si comparten un archivo, marquen zonas

```html
<!-- INICIO: navbar - María -->
<nav>...</nav>
<!-- FIN: navbar - María -->

<!-- INICIO: contenido - Pedro -->
<main>...</main>
<!-- FIN: contenido - Pedro -->
```

### Lo que NUNCA debes subir

- `.env` (variables de entorno)
- Contraseñas, API keys, tokens
- `node_modules/`, `.DS_Store`, archivos temporales
- Bases de datos locales con datos reales

Usa un `.gitignore` desde el inicio del proyecto.

---

## Escenario 14 — Integrar con Pull Request

**Situación:** El equipo usa GitHub/GitLab y quiere revisar código antes de mergear. Muy común en empresas y proyectos serios.

### Quien terminó su parte

```bash
git switch feat/mi-tarea
git pull origin main
git push origin feat/mi-tarea
```

1. Ve al repositorio en GitHub
2. Clic en **Compare & pull request**
3. Describe qué hiciste y qué probar
4. Crea el PR y avisa al equipo

### Quien revisa e integra

1. Revisa los cambios en la pestaña *Files changed*
2. Si está bien → **Merge pull request**
3. Avisa: **"PR mergeado, actualicen sus ramas"**

### Todos después del merge

```bash
git switch feat/mi-tarea
git pull origin main
```

---

## Escenario 15 — Deshacer errores comunes

### Quitaste algo del staging (antes del commit)

```bash
git restore --staged archivo.html
```

### Descartar cambios en un archivo (se pierden para siempre)

```bash
git restore archivo.html
```

### Corregir el último commit (aún sin push)

```bash
git commit --amend -m "feat: mensaje corregido"
```

### Ver qué pasó recientemente

```bash
git log --oneline -10
```

### Ver qué cambió un compañero antes de mergear

```bash
git fetch origin
git diff main..origin/feat/otra-rama
```

> Si **ya hiciste push**, no uses `--amend` ni `--force` sin coordinarlo con el equipo.

---

## Escenario 16 — Commits limpios

**Situación:** Aparece un bot o herramienta de IA como coautor en GitHub (ej. `cursoragent`).

### Prevención

1. En tu editor: desactiva la atribución automática de IA en commits
2. Haz commits desde terminal con tu usuario configurado:

```bash
git add .
git commit -m "feat: mi cambio"
git push
```

### Verifica antes de subir

```bash
git log -1 --format='%B'
```

Si ves `Co-authored-by:` de una herramienta que no quieres, corrígelo **antes** del push.

---

## Guía del líder (crear el repositorio)

**Situación:** Eres quien crea el repo para el equipo. Solo lo hace **una persona**.

### 1. Crear repo en GitHub

- Nombre claro: `mi-proyecto`
- Público o privado según el curso
- **Sin** README, .gitignore ni licencia si el equipo los va a armar juntos

### 2. Agregar colaboradores

`Settings → Collaborators → Add people`

Cada compañero debe **aceptar la invitación** antes de clonar.

### 3. Primer commit

```bash
mkdir mi-proyecto && cd mi-proyecto
git init
echo "# Mi Proyecto" > README.md
git add README.md
git commit -m "chore: initial commit"
git branch -M main
git remote add origin https://github.com/usuario/mi-proyecto.git
git push -u origin main
```

### 4. Compartir la URL en el chat del equipo

```text
https://github.com/usuario/mi-proyecto.git
```

A partir de aquí, el líder trabaja como cualquier colaborador: crea su rama y sigue los escenarios de arriba.

---

## Flujo del día a día (copia esto)

```bash
# === MAÑANA: empezar ===
git switch feat/mi-tarea
git pull origin main
git status

# === DURANTE EL DÍA: guardar avances ===
git add .
git commit -m "feat(modulo): describe tu cambio"
git push

# === ANTES DE PEDIR MERGE ===
git pull origin main
git push

# === CUANDO TOQUE INTEGRAR (uno por uno) ===
git switch main
git pull origin main
git merge feat/mi-tarea
git push origin main
# Avisar al equipo en el chat
```

---

## Errores comunes — solución en 1 línea

| Error o situación | Solución |
|-------------------|----------|
| `CONFLICT` | Abre el archivo, arregla, `git add`, `git commit` |
| `Please commit your changes` | `git add .` + `git commit` o `git stash` |
| `Your branch is behind` | `git pull origin main` |
| `failed to push` | `git pull` primero, resuelve conflictos, luego `git push` |
| Estoy en `main` sin querer | [Escenario 9](#escenario-9--trabajé-en-main-sin-querer) |
| No sé en qué rama estoy | `git branch` |
| `src refspec man does not match any` | La rama se llama `main`, no `man` |
| Subí un archivo que no debía | `git restore --staged archivo` antes del commit |
| El proyecto no corre después de un merge | `git pull origin main`, revisa conflictos mal resueltos |
| Mi compañero borró mi código | Revisa el merge, habla con él, usa `git log` para ver qué pasó |

---

## Comandos que evitar al principio

| Comando | Por qué |
|---------|---------|
| `git push --force` en `main` | Puede borrar el trabajo de otros |
| `git reset --hard` sin entender | Pierdes cambios sin recuperación fácil |
| `git commit -m "cambios"` | Mensaje inútil; nadie sabrá qué hiciste |
| Trabajar todos en `main` | Conflictos constantes |
| Mergear sin avisar al equipo | El resto queda desactualizado |

---

## Checklist antes de decir "terminé"

- [ ] Estoy en **mi rama** (`git branch`)
- [ ] Hice `git pull origin main` hoy
- [ ] Probé que mi parte funciona
- [ ] Commit con mensaje claro (`feat:`, `fix:`, `style:`)
- [ ] `git push` sin errores
- [ ] Solo toqué **mi parte** del proyecto
- [ ] Avisé al equipo si mergeé a `main`
- [ ] No subí archivos secretos ni basura (`git status` limpio)

---

## Resumen visual

```text
         ┌─────────────────────────────────────┐
         │              main                    │
         │      (versión oficial del equipo)    │
         └─────────────────────────────────────┘
              ▲                    │
              │ merge + push       │ pull (actualizar)
              │                    ▼
         ┌─────────────────────────────────────┐
         │          feat/mi-tarea               │
         │       (tu trabajo diario)            │
         └─────────────────────────────────────┘
              │ add → commit → push
              ▼
         GitHub / GitLab
```

**El ciclo que repetirás toda tu carrera:**

```text
rama → cambios → commit → push → merge a main → todos hacen pull origin main
```

---

> **Tip final:** Si te pierdes, ejecuta `git status`, lee qué dice, y busca tu situación en el índice de arriba. Git no es magia: es el mismo ciclo una y otra vez.
