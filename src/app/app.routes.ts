import { Route } from '@angular/router';
import { MainLayoutComponent } from './layout/app-layout/main-layout/main-layout.component';
import { AuthGuard } from '@core/guard/auth.guard';
import { AuthLayoutComponent } from './layout/app-layout/auth-layout/auth-layout.component';
import { Page404Component } from './authentication/page404/page404.component';

export const APP_ROUTE: Route[] = [
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: '/authentication/sign-in', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadChildren: () =>
                    import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTE),
            },
            {
                path: 'settings/roles',
                loadChildren: () =>
                    import('./settings/roles/roles.module').then((m) => m.RolesModule),
            },
            {
                path: 'settings/users',
                loadChildren: () =>
                    import('./settings/users/users.module').then((m) => m.UsersModule),
            },
            {
                path: 'settings/resources',
                loadChildren: () =>
                    import('./settings/resources/resources.module').then((m) => m.ResourcesModule),
            },
            {
                path: 'settings/menus',
                loadChildren: () =>
                    import('./settings/menus/menus.module').then((m) => m.MenusModule),
            },
            {
                path: 'clubs',
                loadChildren: () =>
                    import('./clubs/clubs.module').then((m) => m.ClubsModule),
            },
            {
                path: 'players',
                loadChildren: () =>
                    import('./players/players.module').then((m) => m.PlayersModule),
            },
        ],
    },
    {
        path: 'authentication',
        component: AuthLayoutComponent,
        loadChildren: () =>
            import('./authentication/auth.routes').then((m) => m.AUTH_ROUTE),
    },
    { path: '**', component: Page404Component },
];
