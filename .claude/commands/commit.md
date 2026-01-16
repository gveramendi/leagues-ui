Realiza commit con formato Conventional Commits: $ARGUMENTS

## Paso 1: Analizar cambios
```bash
git status
git diff --staged --stat
```

Si no hay cambios staged, ejecutar:
```bash
git add -A
git diff --staged --stat
```

## Paso 2: Determinar tipo según cambios

| Tipo | Cuándo usar |
|------|-------------|
| feat | Nueva funcionalidad |
| fix | Corrección de bug |
| docs | Solo documentación |
| style | Formato, espacios, punto y coma |
| refactor | Cambio de código sin cambiar funcionalidad |
| test | Agregar o modificar tests |
| chore | Tareas de mantenimiento, deps, configs |

## Paso 3: Determinar scope según archivos

**Backend Spring Boot:**
- src/**/controller/ → scope = nombre del controller (sin "Controller")
- src/**/service/ → scope = nombre del service (sin "Service")
- src/**/repository/ → scope = nombre del repo (sin "Repository")
- src/**/dto/ → scope = dto
- src/**/entity/ → scope = entity
- src/**/config/ → scope = config
- pom.xml, build.gradle → scope = deps

**Backend NestJS:**
- src/modules/{nombre}/ → scope = nombre del módulo
- src/common/ → scope = common
- package.json → scope = deps

**Frontend Angular:**
- src/app/core/services/ → scope = nombre del service
- src/app/core/models/ → scope = models
- src/app/features/{nombre}/ → scope = nombre del feature
- src/app/shared/ → scope = shared
- angular.json, package.json → scope = config

## Paso 4: Generar mensaje

Formato: `<tipo>(<scope>): <descripción>`

Reglas:
- Descripción en español
- Usar imperativo: "agregar", "corregir", "actualizar"
- Máximo 72 caracteres en total
- Sin punto final
- Todo en minúsculas (excepto nombres propios)

Ejemplos buenos:
- `feat(users): agregar endpoint de listado paginado`
- `fix(auth): corregir expiración de token JWT`
- `test(products): agregar tests para ProductService`
- `refactor(orders): extraer validación a servicio`
- `chore(deps): actualizar Spring Boot a 3.2.0`

Ejemplos malos:
- `feat: agregar cosas` (sin scope, muy vago)
- `Fixed bug` (inglés, sin scope, sin formato)
- `feat(users): Agregado endpoint.` (mayúscula, punto final, participio)

## Paso 5: Validar formato
Verificar que cumple:
- [ ] Tipo es válido (feat|fix|docs|style|refactor|test|chore)
- [ ] Scope está presente entre paréntesis
- [ ] Hay dos puntos y espacio después del scope
- [ ] Descripción empieza con minúscula
- [ ] Descripción está en imperativo
- [ ] Total <= 72 caracteres
- [ ] Sin punto final

## Paso 6: Ejecutar commit
```bash
git commit -m "<mensaje generado>"
```

## Paso 7: Confirmar
```bash
git log -1 --oneline
```

## Si el usuario proporcionó contexto en $ARGUMENTS
Usar esa información para enriquecer la descripción del commit.
