import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { RefereeListComponent } from './referee-list.component';
import { RefereeService, ApiResponse, RefereeResponse } from '@core';

describe('RefereeListComponent', () => {
  let component: RefereeListComponent;
  let fixture: ComponentFixture<RefereeListComponent>;
  let refereeServiceSpy: jasmine.SpyObj<RefereeService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockReferee: RefereeResponse = {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    fullName: 'Juan Pérez',
    documentNumber: '12345678',
    licenseNumber: 'LIC-001',
    category: 'NATIONAL',
    dateOfBirth: '1985-05-15',
    nationality: 'Argentina',
    phone: '+54 11 1234-5678',
    email: 'juan.perez@email.com',
    licenseExpiration: '2025-12-31',
    isLicenseValid: true,
  };

  const mockReferees: RefereeResponse[] = [
    mockReferee,
    {
      id: 2,
      firstName: 'Carlos',
      lastName: 'García',
      fullName: 'Carlos García',
      licenseNumber: 'LIC-002',
      category: 'FIFA',
      nationality: 'España',
      email: 'carlos.garcia@email.com',
      isLicenseValid: true,
    },
    {
      id: 3,
      firstName: 'Pedro',
      lastName: 'López',
      fullName: 'Pedro López',
      licenseNumber: 'LIC-003',
      category: 'REGIONAL',
      isLicenseValid: false,
    },
  ];

  const mockListResponse: ApiResponse<RefereeResponse[]> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Referees retrieved successfully',
    },
    body: {
      pagination: {
        totalElements: 3,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false,
      },
      data: mockReferees,
    },
  };

  const mockCreateResponse: ApiResponse<RefereeResponse> = {
    header: {
      success: true,
      statusCode: 201,
      message: 'Referee created successfully',
    },
    body: {
      data: mockReferee,
    },
  };

  const mockUpdateResponse: ApiResponse<RefereeResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Referee updated successfully',
    },
    body: {
      data: { ...mockReferee, firstName: 'Juan Carlos' },
    },
  };

  const mockDeleteResponse: ApiResponse<void> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Referee deleted successfully',
    },
    body: {
      data: undefined as unknown as void,
    },
  };

  beforeEach(waitForAsync(() => {
    const refereeServiceMock = jasmine.createSpyObj('RefereeService', [
      'getAll',
      'search',
      'getByCategory',
      'create',
      'update',
      'delete',
    ]);
    refereeServiceMock.getAll.and.returnValue(of(mockListResponse));
    refereeServiceMock.search.and.returnValue(of(mockListResponse));
    refereeServiceMock.getByCategory.and.returnValue(of(mockListResponse));
    refereeServiceMock.create.and.returnValue(of(mockCreateResponse));
    refereeServiceMock.update.and.returnValue(of(mockUpdateResponse));
    refereeServiceMock.delete.and.returnValue(of(mockDeleteResponse));

    const modalMock = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);
    const toastrMock = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info']);

    TestBed.configureTestingModule({
      imports: [
        RefereeListComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        provideRouter([]),
        { provide: RefereeService, useValue: refereeServiceMock },
        { provide: NgbModal, useValue: modalMock },
        { provide: ToastrService, useValue: toastrMock },
      ],
    }).compileComponents();

    refereeServiceSpy = TestBed.inject(RefereeService) as jasmine.SpyObj<RefereeService>;
    modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefereeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load referees on init', () => {
      expect(refereeServiceSpy.getAll).toHaveBeenCalledWith(0, 10);
      expect(component.rows.length).toBe(3);
      expect(component.filteredRows.length).toBe(3);
    });

    it('should initialize forms', () => {
      expect(component.refereeForm).toBeDefined();
      expect(component.editRefereeForm).toBeDefined();
    });
  });

  describe('loadReferees', () => {
    it('should use getAll when no filters are applied', () => {
      component.searchQuery = '';
      component.selectedCategory = null;

      component.loadReferees();

      expect(refereeServiceSpy.getAll).toHaveBeenCalledWith(0, 10);
    });

    it('should use search when searchQuery has 2 or more characters', () => {
      component.searchQuery = 'Juan';
      component.selectedCategory = null;

      component.loadReferees();

      expect(refereeServiceSpy.search).toHaveBeenCalledWith('Juan', 0, 10);
    });

    it('should not use search when searchQuery has less than 2 characters', () => {
      refereeServiceSpy.getAll.calls.reset();
      component.searchQuery = 'J';
      component.selectedCategory = null;

      component.loadReferees();

      expect(refereeServiceSpy.search).not.toHaveBeenCalled();
      expect(refereeServiceSpy.getAll).toHaveBeenCalled();
    });

    it('should use getByCategory when category is selected', () => {
      component.searchQuery = '';
      component.selectedCategory = 'FIFA';

      component.loadReferees();

      expect(refereeServiceSpy.getByCategory).toHaveBeenCalledWith('FIFA', 0, 10);
    });

    it('should prioritize search over category filter', () => {
      component.searchQuery = 'Juan';
      component.selectedCategory = 'FIFA';

      component.loadReferees();

      expect(refereeServiceSpy.search).toHaveBeenCalledWith('Juan', 0, 10);
      expect(refereeServiceSpy.getByCategory).not.toHaveBeenCalled();
    });

    it('should handle error when loading referees', () => {
      refereeServiceSpy.getAll.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      component.loadReferees();

      expect(component.loading).toBeFalse();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle response without pagination info', () => {
      const responseWithoutPagination: ApiResponse<RefereeResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockReferees },
      };
      refereeServiceSpy.getAll.and.returnValue(of(responseWithoutPagination));

      component.loadReferees();

      expect(component.totalElements).toBe(3);
    });
  });

  describe('onSearchChange', () => {
    it('should update searchQuery and reload referees', () => {
      const event = { target: { value: 'test' } } as unknown as Event;

      component.onSearchChange(event);

      expect(component.searchQuery).toBe('test');
      expect(component.page).toBe(0);
    });
  });

  describe('onCategoryFilter', () => {
    it('should set selectedCategory and reload referees', () => {
      component.onCategoryFilter('FIFA');

      expect(component.selectedCategory).toBe('FIFA');
      expect(component.page).toBe(0);
      expect(refereeServiceSpy.getByCategory).toHaveBeenCalledWith('FIFA', 0, 10);
    });

    it('should set selectedCategory to null for empty string', () => {
      component.onCategoryFilter('');

      expect(component.selectedCategory).toBeNull();
      expect(refereeServiceSpy.getAll).toHaveBeenCalled();
    });

    it('should handle NATIONAL category', () => {
      component.onCategoryFilter('NATIONAL');

      expect(component.selectedCategory).toBe('NATIONAL');
      expect(refereeServiceSpy.getByCategory).toHaveBeenCalledWith('NATIONAL', 0, 10);
    });

    it('should handle REGIONAL category', () => {
      component.onCategoryFilter('REGIONAL');

      expect(component.selectedCategory).toBe('REGIONAL');
      expect(refereeServiceSpy.getByCategory).toHaveBeenCalledWith('REGIONAL', 0, 10);
    });

    it('should handle LOCAL category', () => {
      component.onCategoryFilter('LOCAL');

      expect(component.selectedCategory).toBe('LOCAL');
      expect(refereeServiceSpy.getByCategory).toHaveBeenCalledWith('LOCAL', 0, 10);
    });

    it('should handle TRAINEE category', () => {
      component.onCategoryFilter('TRAINEE');

      expect(component.selectedCategory).toBe('TRAINEE');
      expect(refereeServiceSpy.getByCategory).toHaveBeenCalledWith('TRAINEE', 0, 10);
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters and reload referees', () => {
      component.searchQuery = 'test';
      component.selectedCategory = 'FIFA';
      component.page = 2;

      component.clearFilters();

      expect(component.searchQuery).toBe('');
      expect(component.selectedCategory).toBeNull();
      expect(component.page).toBe(0);
      expect(refereeServiceSpy.getAll).toHaveBeenCalled();
    });
  });

  describe('onPageChange', () => {
    it('should update page and reload referees', () => {
      component.onPageChange({ offset: 2 });

      expect(component.page).toBe(2);
      expect(refereeServiceSpy.getAll).toHaveBeenCalled();
    });
  });

  describe('getCategoryLabel', () => {
    it('should return translation key for category', () => {
      const result = component.getCategoryLabel('FIFA');
      expect(result).toBeDefined();
    });
  });

  describe('getCategoryClass', () => {
    it('should return correct class for FIFA', () => {
      expect(component.getCategoryClass('FIFA')).toBe('bg-primary');
    });

    it('should return correct class for NATIONAL', () => {
      expect(component.getCategoryClass('NATIONAL')).toBe('bg-success');
    });

    it('should return correct class for REGIONAL', () => {
      expect(component.getCategoryClass('REGIONAL')).toBe('bg-info');
    });

    it('should return correct class for LOCAL', () => {
      expect(component.getCategoryClass('LOCAL')).toBe('bg-secondary');
    });

    it('should return correct class for TRAINEE', () => {
      expect(component.getCategoryClass('TRAINEE')).toBe('bg-warning');
    });

    it('should return default class for unknown category', () => {
      expect(component.getCategoryClass('UNKNOWN' as any)).toBe('bg-secondary');
    });
  });

  describe('openAddModal', () => {
    it('should reset form and open modal', () => {
      const mockModalRef = { dismiss: jasmine.createSpy('dismiss') } as unknown as NgbModalRef;
      modalServiceSpy.open.and.returnValue(mockModalRef);
      const content = {};

      component.openAddModal(content);

      expect(modalServiceSpy.open).toHaveBeenCalledWith(content, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg',
      });
    });
  });

  describe('openEditModal', () => {
    it('should set editingReferee and patch form values', () => {
      const mockModalRef = { dismiss: jasmine.createSpy('dismiss') } as unknown as NgbModalRef;
      modalServiceSpy.open.and.returnValue(mockModalRef);
      const content = {};

      component.openEditModal(content, mockReferee);

      expect(component.editingReferee).toEqual(mockReferee);
      expect(component.editRefereeForm.value.firstName).toBe('Juan');
      expect(component.editRefereeForm.value.lastName).toBe('Pérez');
      expect(component.editRefereeForm.value.category).toBe('NATIONAL');
    });
  });

  describe('onAddRefereeSave', () => {
    it('should not save if form is invalid', () => {
      component.refereeForm.controls['firstName'].setValue('');

      component.onAddRefereeSave();

      expect(refereeServiceSpy.create).not.toHaveBeenCalled();
    });

    it('should create referee successfully', () => {
      component.refereeForm.controls['firstName'].setValue('Juan');
      component.refereeForm.controls['lastName'].setValue('Pérez');
      component.refereeForm.controls['licenseNumber'].setValue('LIC-001');
      component.refereeForm.controls['category'].setValue('NATIONAL');

      component.onAddRefereeSave();

      expect(refereeServiceSpy.create).toHaveBeenCalled();
      expect(toastrSpy.success).toHaveBeenCalledWith('Referee created successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
    });

    it('should handle error when creating referee', () => {
      refereeServiceSpy.create.and.returnValue(throwError(() => ({ message: 'Creation failed' })));
      component.refereeForm.controls['firstName'].setValue('Juan');
      component.refereeForm.controls['lastName'].setValue('Pérez');
      component.refereeForm.controls['licenseNumber'].setValue('LIC-001');
      component.refereeForm.controls['category'].setValue('NATIONAL');

      component.onAddRefereeSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('Creation failed');
    });
  });

  describe('onEditRefereeSave', () => {
    it('should not save if no referee is being edited', () => {
      component.editingReferee = null;

      component.onEditRefereeSave();

      expect(refereeServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should update referee successfully', () => {
      component.editingReferee = mockReferee;
      component.editRefereeForm.controls['firstName'].setValue('Juan Carlos');

      component.onEditRefereeSave();

      expect(refereeServiceSpy.update).toHaveBeenCalledWith(1, jasmine.any(Object));
      expect(toastrSpy.success).toHaveBeenCalledWith('Referee updated successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
      expect(component.editingReferee).toBeNull();
    });

    it('should handle error when updating referee', () => {
      refereeServiceSpy.update.and.returnValue(throwError(() => ({ message: 'Update failed' })));
      component.editingReferee = mockReferee;
      component.editRefereeForm.controls['firstName'].setValue('Juan Carlos');

      component.onEditRefereeSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('Update failed');
    });
  });

  describe('deleteReferee', () => {
    it('should show confirmation dialog', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );

      component.deleteReferee(mockReferee);
      tick();

      expect(Swal.fire).toHaveBeenCalled();
    }));

    it('should delete referee when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );

      component.deleteReferee(mockReferee);
      tick();

      expect(refereeServiceSpy.delete).toHaveBeenCalledWith(1);
      expect(toastrSpy.success).toHaveBeenCalledWith('Referee deleted successfully');
    }));

    it('should not delete when cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );

      component.deleteReferee(mockReferee);
      tick();

      expect(refereeServiceSpy.delete).not.toHaveBeenCalled();
    }));

    it('should handle error when deleting referee', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      refereeServiceSpy.delete.and.returnValue(throwError(() => ({ message: 'Delete failed' })));

      component.deleteReferee(mockReferee);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Delete failed');
    }));
  });

  describe('Form Validation', () => {
    describe('refereeForm', () => {
      it('should be invalid when firstName is empty', () => {
        component.refereeForm.controls['firstName'].setValue('');
        expect(component.refereeForm.controls['firstName'].valid).toBeFalse();
      });

      it('should be invalid when lastName is empty', () => {
        component.refereeForm.controls['lastName'].setValue('');
        expect(component.refereeForm.controls['lastName'].valid).toBeFalse();
      });

      it('should be invalid when licenseNumber is empty', () => {
        component.refereeForm.controls['licenseNumber'].setValue('');
        expect(component.refereeForm.controls['licenseNumber'].valid).toBeFalse();
      });

      it('should be invalid when category is empty', () => {
        component.refereeForm.controls['category'].setValue('');
        expect(component.refereeForm.controls['category'].valid).toBeFalse();
      });

      it('should be invalid when firstName is too short', () => {
        component.refereeForm.controls['firstName'].setValue('A');
        expect(component.refereeForm.controls['firstName'].valid).toBeFalse();
      });

      it('should be invalid when email is invalid format', () => {
        component.refereeForm.controls['email'].setValue('invalid-email');
        expect(component.refereeForm.controls['email'].valid).toBeFalse();
      });

      it('should be valid when all required fields are filled', () => {
        component.refereeForm.controls['firstName'].setValue('Juan');
        component.refereeForm.controls['lastName'].setValue('Pérez');
        component.refereeForm.controls['licenseNumber'].setValue('LIC-001');
        component.refereeForm.controls['category'].setValue('NATIONAL');
        expect(component.refereeForm.valid).toBeTrue();
      });
    });
  });

  describe('Categories', () => {
    it('should have all category options', () => {
      expect(component.categories).toContain('FIFA');
      expect(component.categories).toContain('NATIONAL');
      expect(component.categories).toContain('REGIONAL');
      expect(component.categories).toContain('LOCAL');
      expect(component.categories).toContain('TRAINEE');
    });

    it('should have category labels for all categories', () => {
      expect(component.categoryLabels['FIFA']).toBeDefined();
      expect(component.categoryLabels['NATIONAL']).toBeDefined();
      expect(component.categoryLabels['REGIONAL']).toBeDefined();
      expect(component.categoryLabels['LOCAL']).toBeDefined();
      expect(component.categoryLabels['TRAINEE']).toBeDefined();
    });
  });
});
