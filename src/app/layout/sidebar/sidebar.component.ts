import {
  Router,
  NavigationEnd,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { DOCUMENT, NgClass } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { RouteInfo } from './sidebar.metadata';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { NgScrollbar } from 'ngx-scrollbar';
import { AuthService, User } from '@core';
import { SidebarService } from './sidebar.service';
import { Role } from '@core/models/role';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass'],
  imports: [
    RouterLink,
    NgScrollbar,
    RouterLinkActive,
    NgClass,
    FeatherModule,
    TranslateModule,
  ],
})
export class SidebarComponent implements OnInit, OnDestroy, AfterViewInit {

  public sidebarItems!: RouteInfo[];

  public innerHeight?: number;

  public bodyTag!: HTMLElement;

  listMaxHeight?: string;

  listMaxWidth?: string;

  userFullName?: string;

  role?: string;

  userImg?: string;

  userType?: string;

  headerHeight = 60;

  currentRoute?: string;

  routerObj;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService
  ) {
    this.routerObj = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // close sidebar on mobile screen after menu select
        this.renderer.removeClass(this.document.body, 'overlay-open');
        this.sidebbarClose();
        // Expand parent menu for the new route
        setTimeout(() => this.expandActiveMenu(), 100);
      });
  }

  @HostListener('window:resize', ['$event'])
  windowResizecall() {
    if (window.innerWidth < 1025) {
      this.renderer.removeClass(this.document.body, 'side-closed');
    }
    this.setMenuHeight();
    this.checkStatuForResize(false);
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.renderer.removeClass(this.document.body, 'overlay-open');
      this.sidebbarClose();
    }
  }

  callToggleMenu(event: Event, length: number) {
    if (length > 0) {
      const parentElement = (event.target as HTMLInputElement).closest('li');
      const isOpen = parentElement?.classList.contains('menu-open');

      if (isOpen) {
        this.renderer.removeClass(parentElement, 'menu-open');
      } else {
        this.renderer.addClass(parentElement, 'menu-open');
      }
    }
  }

  ngOnInit() {
    const user: User = this.authService.currentUserValue;
    if (user) {
      this.sidebarService.getRouteInfo().subscribe((routes: RouteInfo[]) => {
        this.sidebarItems = routes.filter((sidebarItem) => sidebarItem);
      });

      this.userFullName = `${user.firstName} ${user.lastName}`;

      // Handle roles as string[] or Role[]
      if (user.roles && user.roles.length > 0) {
        if (typeof user.roles[0] === 'string') {
          this.role = user.roles[0] as string;
        } else {
          this.role = (user.roles[0] as Role).name;
        }
      }
    }
    this.initLeftSidebar();
    this.bodyTag = this.document.body;
  }

  ngOnDestroy() {
    this.routerObj.unsubscribe();
  }

  ngAfterViewInit() {
    // Expand parent menu for current route after view is initialized
    setTimeout(() => this.expandActiveMenu(), 100);
  }

  private expandActiveMenu() {
    const currentUrl = this.router.url;
    if (!this.sidebarItems) return;

    // Find and expand parent menu if current route is a submenu item
    this.sidebarItems.forEach((item) => {
      if (item.submenu && item.submenu.length > 0) {
        const hasActiveChild = item.submenu.some((subItem) =>
          currentUrl.startsWith(subItem.path)
        );
        if (hasActiveChild) {
          // Find the parent li element and add menu-open class
          const menuItems = this.elementRef.nativeElement.querySelectorAll('.list > li');
          menuItems.forEach((menuItem: HTMLElement) => {
            const link = menuItem.querySelector('a.menu-toggle');
            if (link) {
              const titleSpan = link.querySelector('.hide-menu');
              if (titleSpan && titleSpan.textContent?.trim() === item.title) {
                this.renderer.addClass(menuItem, 'menu-open');
              }
            }
          });
        }
      }
    });
  }

  initLeftSidebar() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    // Set menu height
    _this.setMenuHeight();
    _this.checkStatuForResize(true);
  }

  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    const height = this.innerHeight - this.headerHeight;
    this.listMaxHeight = height + '';
    this.listMaxWidth = '500px';
  }

  isOpen() {
    return this.bodyTag.classList.contains('overlay-open');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkStatuForResize(firstTime: boolean) {
    if (window.innerWidth < 1025) {
      this.renderer.addClass(this.document.body, 'sidebar-gone');
    } else {
      this.renderer.removeClass(this.document.body, 'sidebar-gone');
    }
  }

  mouseHover() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('submenu-closed')) {
      this.renderer.addClass(this.document.body, 'side-closed-hover');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
    }
  }

  mouseOut() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('side-closed-hover')) {
      this.renderer.removeClass(this.document.body, 'side-closed-hover');
      this.renderer.addClass(this.document.body, 'submenu-closed');
    }
  }

  sidebbarClose() {
    if (window.innerWidth < 1025) {
      this.renderer.addClass(this.document.body, 'sidebar-gone');
    }
  }
}
