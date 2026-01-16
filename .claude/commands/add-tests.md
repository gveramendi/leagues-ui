Genera pruebas unitarias para: $ARGUMENTS

## Detección de stack
Analiza el archivo y detecta el stack por extensión y estructura:

### Si es Java (Spring Boot)
- Extensión: .java
- Tests en: src/test/java/
- Framework: JUnit 5 + Mockito
- Build tool: pom.xml (Maven) | build.gradle (Gradle Groovy) | build.gradle.kts (Gradle Kotlin)

**Ejecutar:**
- Maven: `./mvnw test -Dtest=NombreTest`
- Gradle: `./gradlew test --tests "NombreTest"`

### Si es TypeScript backend (NestJS)
- Extensión: .ts con .module.ts en carpeta
- Tests junto al archivo: *.spec.ts
- Framework: Jest

**Ejecutar:** `npm run test -- --testPathPattern=nombre`

### Si es TypeScript frontend (Angular)
- Extensión: .ts con angular.json en root
- Tests junto al archivo: *.spec.ts
- Framework: Jasmine

**Ejecutar:** `ng test --include=**/nombre.spec.ts`

## Instrucciones generales
1. Analizar el código existente
2. Identificar dependencias a mockear
3. Crear casos de prueba:
   - Happy path
   - Edge cases
   - Error handling
4. Patrón AAA: Arrange - Act - Assert
5. Ejecutar y verificar que pasen
