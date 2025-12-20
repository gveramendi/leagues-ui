# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Oreva** - Angular 19 web application using standalone components architecture. This is a leagues/sports management UI with role-based access control, multi-language support, and dashboard visualizations.

Project name in package.json: `oreva`

## Development Commands

### Running the Application
```bash
# Start development server (http://localhost:4200/)
ng serve
# Or
npm start
```

### Building
```bash
# Production build (outputs to dist/oreva/)
ng build

# Development build with source maps
ng build --configuration=development
```

### Testing
```bash
# Run unit tests via Karma
ng test

# Run tests for a specific file
ng test --include='**/auth.service.spec.ts'
```

### Linting
```bash
# Lint TypeScript and HTML files
ng lint
```

### Code Generation
```bash
# Generate new components (uses SCSS by default)
ng generate component component-name

# Other generators
ng generate directive|pipe|service|class|guard|interface|enum|module
```

## Application Architecture

### Directory Structure
```
src/app/
├── authentication/     # Auth pages (signin, signup, forgot, reset, error pages)
├── config/            # ConfigService for theme/layout settings
├── core/              # Core services, guards, interceptors, models
├── dashboard/         # Dashboard feature with ApexCharts visualizations
└── layout/            # Layout components (header, sidebar, footer, page-loader)
```

### Routing Architecture

**Two-Layout System:**
- **MainLayoutComponent** (`layout/app-layout/main-layout`): Authenticated routes with header + sidebar
- **AuthLayoutComponent** (`layout/app-layout/auth-layout`): Public authentication pages

All feature routes are lazy-loaded. Root route (`''`) redirects to `/authentication/sign-in` by default.

**Route Protection:** All authenticated routes use `AuthGuard` which checks for currentUser in localStorage.

### Authentication Flow

1. Login via `/api/authentication/sign-in` endpoint
2. Response includes user data + JWT token
3. Token and user stored in localStorage
4. `AuthService.currentUser` BehaviorSubject broadcasts auth state changes
5. `JwtInterceptor` and `ErrorInterceptor` handle 401 responses (auto-logout + reload)

**Key Services:**
- `AuthService` (core/service/auth.service.ts): Manages authentication state
- `AuthGuard` (core/guard/auth.guard.ts): Protects routes requiring authentication

### Role-Based Access Control (RBAC)

Navigation sidebar is dynamically built from:
1. Static routes defined in `src/assets/data/routes.json`
2. User's resources (permissions) from User model
3. `SidebarService.buildSubmenuItem()` filters menu items by user role

**Resource Model:**
- Each resource has: `creatable`, `readable`, `updatable`, `deletable`, `executable` flags
- Resources grouped by `groupName` for sidebar organization

### State Management

**Pattern:** Simple BehaviorSubject-based observables (no NgRx/Redux)

**Key State Services:**
- `AuthService.currentUser`: Observable<User> for authentication state
- `ConfigService`: Theme and layout preferences (persisted to localStorage)
- `RightSidebarService`: Right sidebar visibility toggle
- `DirectionService`: LTR/RTL text direction

### Internationalization (i18n)

- **Library:** ngx-translate
- **Languages:** English (en), Spanish (es), German (de)
- **Translation Files:** `src/assets/i18n/{lang}.json`
- **Service:** `LanguageService` (core/service/language.service.ts)
- **Direction Support:** RTL/LTR via `DirectionService`

### HTTP Interceptors

**JwtInterceptor** (core/interceptor/jwt.interceptor.ts):
- Handles 401 Unauthorized responses
- Auto-logout and reload on authentication failure

**ErrorInterceptor** (core/interceptor/error.interceptor.ts):
- Error handling and response error extraction

### Environment Configuration

**Hash-based Routing:** Uses `HashLocationStrategy` (#-based URLs) instead of path-based routing.

**Environment Files:**
- `src/environments/environment.ts` - Production config
- `src/environments/environment.development.ts` - Development config (file replacement during build)
- API URL configured via `environment.apiUrl`

### UI Framework & Key Dependencies

- **Bootstrap 5** via ng-bootstrap for responsive layout
- **ApexCharts** (ng-apexcharts) for dashboard visualizations
- **Feather Icons** (angular-feather) - all icons loaded via `app.config.ts`
- **ngx-toastr** for toast notifications
- **ngx-scrollbar** for custom scrollbars
- **Theme System:** Light/Dark mode with 7 color variants (white, cyan, black, purple, orange, green, red)

### Important Patterns

**Standalone Components:** This project uses Angular 14+ standalone component architecture (no NgModule declarations).

**Application Providers** (app.config.ts):
- HTTP interceptors registered via `HTTP_INTERCEPTORS` multi-provider
- Translate module configured with default language 'en'
- Chart.js registerables auto-configured
- Feather icons pre-loaded with all icons

**Path Aliases:**
- `@core` → `src/app/core`
- Configure in `tsconfig.json` paths

### Build Configuration Notes

**Bundle Size Limits:**
- Initial bundle: 4MB warning, 6MB error
- Component styles: 2KB warning, 4KB error

**Allowed CommonJS Dependencies:** The build allows specific CommonJS modules (echarts, apexcharts, sweetalert2, etc.) - see `angular.json` allowedCommonJsDependencies.

**Global Styles Order:**
1. Bootstrap CSS
2. Third-party library styles (ngx-datatable, ng-select, ngx-toastr)
3. Custom SCSS: `assets/scss/style.scss`
4. `styles.scss`

**Global Scripts:**
- Moment.js (loaded globally for date handling)
- ApexCharts (loaded globally for charts)

### Testing

Tests use Jasmine + Karma. Spec files exist for most components and services. The project uses Angular's default testing setup with zone.js/testing polyfill.
