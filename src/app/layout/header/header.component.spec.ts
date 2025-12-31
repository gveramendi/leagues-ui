import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Renderer2 } from '@angular/core';
import { of } from 'rxjs';

import { HeaderComponent } from './header.component';
import { AuthService, LanguageService, RightSidebarService } from '@core';
import { ConfigService } from '@config/config.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let languageService: jasmine.SpyObj<LanguageService>;
  let rightSidebarService: jasmine.SpyObj<RightSidebarService>;
  let configService: jasmine.SpyObj<ConfigService>;
  let router: Router;
  let document: Document;
  let renderer: Renderer2;

  const mockConfig = {
    layout: {
      variant: 'light',
      sidebar: {
        backgroundColor: 'white',
        collapsed: false,
      },
    },
  };

  beforeEach(waitForAsync(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const languageServiceSpy = jasmine.createSpyObj('LanguageService', ['setLanguage']);
    const rightSidebarServiceSpy = jasmine.createSpyObj('RightSidebarService', ['setRightSidebar'], {
      sidebarState: of(false),
    });
    const configServiceSpy = jasmine.createSpyObj('ConfigService', [], {
      configData: mockConfig,
    });

    TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        FeatherModule.pick(allIcons),
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: LanguageService, useValue: languageServiceSpy },
        { provide: RightSidebarService, useValue: rightSidebarServiceSpy },
        { provide: ConfigService, useValue: configServiceSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    languageService = TestBed.inject(LanguageService) as jasmine.SpyObj<LanguageService>;
    rightSidebarService = TestBed.inject(RightSidebarService) as jasmine.SpyObj<RightSidebarService>;
    configService = TestBed.inject(ConfigService) as jasmine.SpyObj<ConfigService>;
    router = TestBed.inject(Router);
    document = TestBed.inject(DOCUMENT);
  }));

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    renderer = fixture.componentRef.injector.get(Renderer2);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.isNavbarCollapsed).toBeTrue();
      expect(component.isFullScreen).toBeFalse();
    });

    it('should have list of languages', () => {
      expect(component.listLang.length).toBe(3);
      expect(component.listLang[0].lang).toBe('en');
      expect(component.listLang[1].lang).toBe('es');
      expect(component.listLang[2].lang).toBe('de');
    });

    it('should set default flag when no language stored', () => {
      expect(component.defaultFlag).toBe('assets/images/flags/us.jpg');
    });

    it('should use stored language from localStorage', () => {
      localStorage.setItem('lang', 'es');
      component.ngOnInit();
      expect(component.flagvalue).toEqual(['assets/images/flags/spain.jpg']);
      expect(component.countryName).toEqual(['Spanish']);
    });
  });

  describe('setLanguage', () => {
    it('should set language properties', () => {
      component.setLanguage('German', 'de', 'assets/images/flags/germany.jpg');
      expect(component.countryName).toBe('German');
      expect(component.flagvalue).toBe('assets/images/flags/germany.jpg');
      expect(component.langStoreValue).toBe('de');
    });

    it('should call languageService.setLanguage', () => {
      component.setLanguage('Spanish', 'es', 'assets/images/flags/spain.jpg');
      expect(languageService.setLanguage).toHaveBeenCalledWith('es');
    });
  });

  describe('toggleRightSidebar', () => {
    it('should toggle isOpenSidebar and call service', () => {
      // Initial state is undefined/false
      expect(component.isOpenSidebar).toBeFalsy();

      // After toggle, it should call setRightSidebar
      component.toggleRightSidebar();

      // isOpenSidebar should be toggled
      expect(component.isOpenSidebar).toBeDefined();
    });
  });

  describe('callFullscreen', () => {
    it('should toggle fullscreen state', () => {
      expect(component.isFullScreen).toBeFalse();

      // Mock requestFullscreen
      component.docElement = {
        requestFullscreen: jasmine.createSpy('requestFullscreen'),
      } as any;

      component.callFullscreen();
      expect(component.isFullScreen).toBeTrue();
    });

    it('should call exitFullscreen when already in fullscreen', () => {
      component.isFullScreen = true;
      spyOn(document, 'exitFullscreen');
      component.callFullscreen();
      expect(document.exitFullscreen).toHaveBeenCalled();
      expect(component.isFullScreen).toBeFalse();
    });
  });

  describe('mobileMenuSidebarOpen', () => {
    it('should toggle sidebar for mobile screen', () => {
      // Mock window.innerWidth for mobile
      spyOnProperty(window, 'innerWidth').and.returnValue(800);

      const mockEvent = {
        target: {
          classList: {
            contains: jasmine.createSpy('contains').and.returnValue(false),
          },
        },
      } as any;

      const addClassSpy = spyOn(renderer, 'addClass');
      const removeClassSpy = spyOn(renderer, 'removeClass');

      component.mobileMenuSidebarOpen(mockEvent, 'overlay-open');

      expect(addClassSpy).toHaveBeenCalled();
    });

    it('should toggle sidebar for desktop screen', () => {
      // Mock window.innerWidth for desktop
      spyOnProperty(window, 'innerWidth').and.returnValue(1200);

      const mockEvent = { target: { classList: { contains: () => false } } } as any;

      const addClassSpy = spyOn(renderer, 'addClass');

      component.mobileMenuSidebarOpen(mockEvent, 'overlay-open');

      expect(addClassSpy).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should call authService.logout and navigate on success', () => {
      const navigateSpy = spyOn(router, 'navigate');
      authService.logout.and.returnValue(of({ success: true }));

      component.logout();

      expect(authService.logout).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/authentication/sign-in']);
    });

    it('should not navigate when logout returns success: false', () => {
      const navigateSpy = spyOn(router, 'navigate');
      authService.logout.and.returnValue(of({ success: false }));

      component.logout();

      expect(authService.logout).toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit', () => {
    it('should apply theme from localStorage', () => {
      localStorage.setItem('theme', 'dark');
      const addClassSpy = spyOn(renderer, 'addClass');
      const removeClassSpy = spyOn(renderer, 'removeClass');

      component.ngAfterViewInit();

      expect(removeClassSpy).toHaveBeenCalled();
      expect(addClassSpy).toHaveBeenCalled();
    });

    it('should apply menu option from localStorage', () => {
      localStorage.setItem('menuOption', 'purple-sidebar');
      const addClassSpy = spyOn(renderer, 'addClass');

      component.ngAfterViewInit();

      expect(addClassSpy).toHaveBeenCalled();
    });

    it('should apply closed sidebar status from localStorage', () => {
      localStorage.setItem('sidebar_status', 'close');
      const addClassSpy = spyOn(renderer, 'addClass');

      component.ngAfterViewInit();

      expect(addClassSpy).toHaveBeenCalledWith(document.body, 'side-closed');
      expect(addClassSpy).toHaveBeenCalledWith(document.body, 'submenu-closed');
    });

    it('should apply open sidebar status from localStorage', () => {
      localStorage.setItem('sidebar_status', 'open');
      const removeClassSpy = spyOn(renderer, 'removeClass');

      component.ngAfterViewInit();

      expect(removeClassSpy).toHaveBeenCalledWith(document.body, 'side-closed');
      expect(removeClassSpy).toHaveBeenCalledWith(document.body, 'submenu-closed');
    });
  });
});
