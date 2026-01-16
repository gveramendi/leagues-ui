# Frontend - Angular

## Proyecto relacionado
Backend Spring Boot en: ../leagues-api

## Stack
- Angular + TypeScript
- Jasmine para testing

## API Base
http://localhost:8080/api

## Integración con Backend
Los models en src/app/core/models/ corresponden a los DTOs del backend.

## Estructura
```
src/app/
├── core/
│   ├── services/    → Llamadas HTTP al backend
│   └── models/      → Interfaces (espejo de DTOs)
├── shared/          → Componentes reutilizables
├── features/        → Módulos por funcionalidad
└── environments/    → Config por ambiente
```

## Ejecutar
ng serve

## Tests
ng test


## Convención de Commits

Formato obligatorio: `<tipo>(<scope>): <descripción>`

### Tipos
| Tipo | Uso |
|------|-----|
| feat | Nueva funcionalidad |
| fix | Corrección de bug |
| docs | Documentación |
| style | Formato |
| refactor | Refactorización |
| test | Tests |
| chore | Mantenimiento |

### Reglas
- Descripción en español, imperativo, minúsculas
- Máximo 72 caracteres
- Sin punto final

### Ejemplos
- `feat(users): agregar endpoint de listado`
- `fix(auth): corregir validación de token`
- `test(products): agregar tests unitarios`

