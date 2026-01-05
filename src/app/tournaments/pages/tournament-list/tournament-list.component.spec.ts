import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { TournamentListComponent } from './tournament-list.component';
import { TournamentService, ApiResponse, TournamentResponse, TournamentRulesDto } from '@core';

describe('TournamentListComponent', () => {
  let component: TournamentListComponent;
  let fixture: ComponentFixture<TournamentListComponent>;
  let tournamentServiceSpy: jasmine.SpyObj<TournamentService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let router: Router;

  const mockRules: TournamentRulesDto = {
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    matchDurationMinutes: 90,
    halfTimeDurationMinutes: 15,
    allowsExtraTime: false,
    extraTimeDurationMinutes: 30,
    allowsPenalties: true,
    homeAndAway: true,
    yellowCardsForSuspension: 5,
    redCardSuspensionMatches: 1,
    maxPlayersPerTeam: 25,
    minPlayersPerTeam: 11,
    maxForeignPlayers: 5,
    substitutionsAllowed: 5,
    firstTiebreaker: 'GOAL_DIFFERENCE',
    secondTiebreaker: 'GOALS_SCORED',
    thirdTiebreaker: 'HEAD_TO_HEAD',
  };

  const mockTournament: TournamentResponse = {
    id: 1,
    code: 'LIGA2024',
    name: 'Liga Nacional 2024',
    shortName: 'Liga 2024',
    description: 'Torneo oficial',
    format: 'LEAGUE',
    status: 'DRAFT',
    category: 'PRIMERA',
    gender: 'MALE',
    footballType: 'FOOTBALL_11',
    seasonYear: 2024,
    startDate: '2024-03-01',
    endDate: '2024-12-15',
    registrationStart: '2024-01-01',
    registrationEnd: '2024-02-28',
    minTeams: 10,
    maxTeams: 20,
    logoUrl: 'https://example.com/logo.png',
    organizer: 'Federacion Nacional',
    location: 'Nacional',
    prizeDescription: 'Trofeo',
    rules: mockRules,
    registeredTeamsCount: 0,
    approvedTeamsCount: 0,
  };

  const mockTournaments: TournamentResponse[] = [
    mockTournament,
    {
      id: 2,
      code: 'COPA2024',
      name: 'Copa Nacional 2024',
      shortName: 'Copa 2024',
      format: 'SINGLE_ELIMINATION',
      status: 'REGISTRATION_OPEN',
      category: 'SUB_20',
      gender: 'MALE',
      footballType: 'FOOTBALL_11',
      seasonYear: 2024,
      minTeams: 8,
      maxTeams: 16,
      organizer: 'Federacion',
      location: 'Nacional',
      registeredTeamsCount: 5,
      approvedTeamsCount: 3,
    },
  ];

  const mockSearchResponse: ApiResponse<TournamentResponse[]> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Tournaments retrieved successfully',
    },
    body: {
      pagination: {
        totalElements: 2,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false,
      },
      data: mockTournaments,
    },
  };

  const mockCreateResponse: ApiResponse<TournamentResponse> = {
    header: {
      success: true,
      statusCode: 201,
      message: 'Tournament created successfully',
    },
    body: {
      data: mockTournament,
    },
  };

  const mockUpdateResponse: ApiResponse<TournamentResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Tournament updated successfully',
    },
    body: {
      data: { ...mockTournament, name: 'Updated Liga 2024' },
    },
  };

  const mockDeleteResponse: ApiResponse<void> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Tournament deleted successfully',
    },
    body: {
      data: undefined as unknown as void,
    },
  };

  beforeEach(waitForAsync(() => {
    const tournamentServiceMock = jasmine.createSpyObj('TournamentService', [
      'search',
      'create',
      'update',
      'delete',
    ]);
    tournamentServiceMock.search.and.returnValue(of(mockSearchResponse));
    tournamentServiceMock.create.and.returnValue(of(mockCreateResponse));
    tournamentServiceMock.update.and.returnValue(of(mockUpdateResponse));
    tournamentServiceMock.delete.and.returnValue(of(mockDeleteResponse));

    const modalMock = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);
    const toastrMock = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [
        TournamentListComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        provideRouter([]),
        { provide: TournamentService, useValue: tournamentServiceMock },
        { provide: NgbModal, useValue: modalMock },
        { provide: ToastrService, useValue: toastrMock },
      ],
    }).compileComponents();

    tournamentServiceSpy = TestBed.inject(TournamentService) as jasmine.SpyObj<TournamentService>;
    modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load tournaments on init', () => {
      expect(tournamentServiceSpy.search).toHaveBeenCalledWith('', 0, 10, 'createdAt,desc');
      expect(component.rows.length).toBe(2);
      expect(component.filteredRows.length).toBe(2);
    });
  });

  describe('loadTournaments', () => {
    it('should load tournaments successfully', () => {
      component.loadTournaments();

      expect(component.loading).toBeFalse();
      expect(component.rows).toEqual(mockTournaments);
      expect(component.totalElements).toBe(2);
    });

    it('should handle error when loading tournaments', () => {
      tournamentServiceSpy.search.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      component.loadTournaments();

      expect(component.loading).toBeFalse();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle response without pagination info', () => {
      const responseWithoutPagination: ApiResponse<TournamentResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Success',
        },
        body: {
          data: mockTournaments,
        },
      };
      tournamentServiceSpy.search.and.returnValue(of(responseWithoutPagination));

      component.loadTournaments();

      expect(component.totalElements).toBe(0);
      expect(component.rows).toEqual(mockTournaments);
    });
  });

  describe('filterDatatable', () => {
    it('should filter rows by code', () => {
      component.rows = mockTournaments;
      component.filteredRows = [...mockTournaments];

      const event = { target: { value: 'LIGA' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].code).toBe('LIGA2024');
    });

    it('should filter rows by name', () => {
      component.rows = mockTournaments;
      component.filteredRows = [...mockTournaments];

      const event = { target: { value: 'Copa' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].name).toBe('Copa Nacional 2024');
    });

    it('should filter rows by shortName', () => {
      component.rows = mockTournaments;
      component.filteredRows = [...mockTournaments];

      const event = { target: { value: 'Liga 2024' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].shortName).toBe('Liga 2024');
    });

    it('should filter rows by organizer', () => {
      component.rows = mockTournaments;
      component.filteredRows = [...mockTournaments];

      const event = { target: { value: 'Nacional' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(2);
    });

    it('should filter rows by location', () => {
      component.rows = mockTournaments;
      component.filteredRows = [...mockTournaments];

      const event = { target: { value: 'Nacional' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(2);
    });

    it('should filter rows by id', () => {
      component.rows = mockTournaments;
      component.filteredRows = [...mockTournaments];

      const event = { target: { value: '1' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].id).toBe(1);
    });

    it('should return all rows when filter is empty', () => {
      component.rows = mockTournaments;
      component.filteredRows = [...mockTournaments];

      const event = { target: { value: '' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(2);
    });

    it('should be case insensitive', () => {
      component.rows = mockTournaments;
      component.filteredRows = [...mockTournaments];

      const event = { target: { value: 'liga' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].code).toBe('LIGA2024');
    });
  });

  describe('onPageChange', () => {
    it('should update page and reload tournaments', () => {
      component.onPageChange({ offset: 2 });

      expect(component.page).toBe(2);
      expect(tournamentServiceSpy.search).toHaveBeenCalled();
    });
  });

  describe('onSort', () => {
    it('should update sort and reload tournaments', () => {
      component.onSort({ sorts: [{ prop: 'name', dir: 'desc' }] });

      expect(component.sort).toBe('name,desc');
      expect(component.page).toBe(0);
      expect(tournamentServiceSpy.search).toHaveBeenCalled();
    });

    it('should handle ascending sort', () => {
      component.onSort({ sorts: [{ prop: 'code', dir: 'asc' }] });

      expect(component.sort).toBe('code,asc');
      expect(component.page).toBe(0);
    });
  });

  describe('openAddModal', () => {
    it('should reset form with default values and open modal', () => {
      const mockModalRef = { dismiss: jasmine.createSpy('dismiss') } as unknown as NgbModalRef;
      modalServiceSpy.open.and.returnValue(mockModalRef);
      const content = {};

      component.openAddModal(content);

      expect(modalServiceSpy.open).toHaveBeenCalledWith(content, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'xl',
      });
      expect(component.tournamentForm.value.format).toBe('LEAGUE');
      expect(component.tournamentForm.value.category).toBe('PRIMERA');
      expect(component.tournamentForm.value.gender).toBe('MALE');
      expect(component.tournamentForm.value.footballType).toBe('FOOTBALL_11');
      expect(component.tournamentForm.value.pointsForWin).toBe(3);
    });
  });

  describe('onAddTournamentSave', () => {
    it('should not save if form is invalid', () => {
      component.tournamentForm.controls['code'].setValue('');
      component.tournamentForm.controls['name'].setValue('');

      component.onAddTournamentSave();

      expect(tournamentServiceSpy.create).not.toHaveBeenCalled();
    });

    it('should create tournament successfully', () => {
      component.tournamentForm.controls['code'].setValue('NEW2024');
      component.tournamentForm.controls['name'].setValue('New Tournament 2024');

      component.onAddTournamentSave();

      expect(tournamentServiceSpy.create).toHaveBeenCalled();
      expect(toastrSpy.success).toHaveBeenCalledWith('Tournament created successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
    });

    it('should include rules in create request', () => {
      component.tournamentForm.controls['code'].setValue('NEW2024');
      component.tournamentForm.controls['name'].setValue('New Tournament 2024');
      component.tournamentForm.controls['pointsForWin'].setValue(3);
      component.tournamentForm.controls['pointsForDraw'].setValue(1);

      component.onAddTournamentSave();

      const callArgs = tournamentServiceSpy.create.calls.mostRecent().args[0];
      expect(callArgs.rules).toBeDefined();
      expect(callArgs.rules?.pointsForWin).toBe(3);
      expect(callArgs.rules?.pointsForDraw).toBe(1);
    });

    it('should handle error when creating tournament', () => {
      tournamentServiceSpy.create.and.returnValue(
        throwError(() => ({ message: 'Creation failed' }))
      );
      component.tournamentForm.controls['code'].setValue('NEW2024');
      component.tournamentForm.controls['name'].setValue('New Tournament 2024');

      component.onAddTournamentSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('Creation failed');
    });

    it('should handle string error when creating tournament', () => {
      tournamentServiceSpy.create.and.returnValue(
        throwError(() => 'String error message')
      );
      component.tournamentForm.controls['code'].setValue('NEW2024');
      component.tournamentForm.controls['name'].setValue('New Tournament 2024');

      component.onAddTournamentSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('String error message');
    });

    it('should use default error message when error is undefined', () => {
      tournamentServiceSpy.create.and.returnValue(
        throwError(() => ({}))
      );
      component.tournamentForm.controls['code'].setValue('NEW2024');
      component.tournamentForm.controls['name'].setValue('New Tournament 2024');

      component.onAddTournamentSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('Error creating tournament');
    });
  });

  describe('openEditModal', () => {
    it('should set editing tournament and open modal', () => {
      const mockModalRef = { dismiss: jasmine.createSpy('dismiss') } as unknown as NgbModalRef;
      modalServiceSpy.open.and.returnValue(mockModalRef);
      const content = {};

      component.openEditModal(content, mockTournament);

      expect(component.editingTournament).toEqual(mockTournament);
      expect(modalServiceSpy.open).toHaveBeenCalledWith(content, {
        ariaLabelledBy: 'modal-edit-title',
        size: 'xl',
      });
    });

    it('should patch all form values from tournament', () => {
      const mockModalRef = { dismiss: jasmine.createSpy('dismiss') } as unknown as NgbModalRef;
      modalServiceSpy.open.and.returnValue(mockModalRef);
      const content = {};

      component.openEditModal(content, mockTournament);

      expect(component.editTournamentForm.value.name).toBe('Liga Nacional 2024');
      expect(component.editTournamentForm.value.shortName).toBe('Liga 2024');
      expect(component.editTournamentForm.value.description).toBe('Torneo oficial');
      expect(component.editTournamentForm.value.format).toBe('LEAGUE');
      expect(component.editTournamentForm.value.category).toBe('PRIMERA');
      expect(component.editTournamentForm.value.gender).toBe('MALE');
      expect(component.editTournamentForm.value.footballType).toBe('FOOTBALL_11');
      expect(component.editTournamentForm.value.seasonYear).toBe(2024);
    });

    it('should patch rules values from tournament', () => {
      const mockModalRef = { dismiss: jasmine.createSpy('dismiss') } as unknown as NgbModalRef;
      modalServiceSpy.open.and.returnValue(mockModalRef);
      const content = {};

      component.openEditModal(content, mockTournament);

      expect(component.editTournamentForm.value.pointsForWin).toBe(3);
      expect(component.editTournamentForm.value.pointsForDraw).toBe(1);
      expect(component.editTournamentForm.value.matchDurationMinutes).toBe(90);
      expect(component.editTournamentForm.value.firstTiebreaker).toBe('GOAL_DIFFERENCE');
    });
  });

  describe('onEditTournamentSave', () => {
    it('should not save if form is invalid', () => {
      component.editTournamentForm.controls['name'].setValue('');
      component.editingTournament = mockTournament;

      component.onEditTournamentSave();

      expect(tournamentServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should not save if no tournament is being edited', () => {
      component.editTournamentForm.controls['name'].setValue('Updated Name');
      component.editingTournament = null;

      component.onEditTournamentSave();

      expect(tournamentServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should update tournament successfully', () => {
      component.editingTournament = mockTournament;
      component.editTournamentForm.controls['name'].setValue('Updated Liga 2024');

      component.onEditTournamentSave();

      expect(tournamentServiceSpy.update).toHaveBeenCalledWith(1, jasmine.any(Object));
      expect(toastrSpy.success).toHaveBeenCalledWith('Tournament updated successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
      expect(component.editingTournament).toBeNull();
    });

    it('should include rules in update request', () => {
      component.editingTournament = mockTournament;
      component.editTournamentForm.controls['name'].setValue('Updated Liga 2024');
      component.editTournamentForm.controls['pointsForWin'].setValue(4);

      component.onEditTournamentSave();

      const callArgs = tournamentServiceSpy.update.calls.mostRecent().args[1];
      expect(callArgs.rules).toBeDefined();
      expect(callArgs.rules?.pointsForWin).toBe(4);
    });

    it('should handle error when updating tournament', () => {
      tournamentServiceSpy.update.and.returnValue(
        throwError(() => ({ message: 'Update failed' }))
      );
      component.editingTournament = mockTournament;
      component.editTournamentForm.controls['name'].setValue('Updated Liga 2024');

      component.onEditTournamentSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('Update failed');
    });

    it('should handle string error when updating tournament', () => {
      tournamentServiceSpy.update.and.returnValue(
        throwError(() => 'String update error')
      );
      component.editingTournament = mockTournament;
      component.editTournamentForm.controls['name'].setValue('Updated Liga 2024');

      component.onEditTournamentSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('String update error');
    });
  });

  describe('deleteTournament', () => {
    it('should show confirmation dialog', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );

      component.deleteTournament(mockTournament);
      tick();

      expect(Swal.fire).toHaveBeenCalled();
    }));

    it('should delete tournament when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );

      component.deleteTournament(mockTournament);
      tick();

      expect(tournamentServiceSpy.delete).toHaveBeenCalledWith(1);
      expect(toastrSpy.success).toHaveBeenCalledWith('Tournament deleted successfully');
    }));

    it('should not delete when cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );

      component.deleteTournament(mockTournament);
      tick();

      expect(tournamentServiceSpy.delete).not.toHaveBeenCalled();
    }));

    it('should handle error when deleting tournament', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      tournamentServiceSpy.delete.and.returnValue(
        throwError(() => ({ message: 'Delete failed' }))
      );

      component.deleteTournament(mockTournament);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Delete failed');
    }));

    it('should handle string error when deleting tournament', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      tournamentServiceSpy.delete.and.returnValue(
        throwError(() => 'String delete error')
      );

      component.deleteTournament(mockTournament);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('String delete error');
    }));
  });

  describe('viewTournament', () => {
    it('should navigate to tournament detail', () => {
      const navigateSpy = spyOn(router, 'navigate');

      component.viewTournament(mockTournament);

      expect(navigateSpy).toHaveBeenCalledWith(['/tournaments', 1]);
    });
  });

  describe('getStatusClass', () => {
    it('should return correct class for DRAFT status', () => {
      expect(component.getStatusClass('DRAFT')).toBe('bg-secondary');
    });

    it('should return correct class for REGISTRATION_OPEN status', () => {
      expect(component.getStatusClass('REGISTRATION_OPEN')).toBe('bg-info');
    });

    it('should return correct class for REGISTRATION_CLOSED status', () => {
      expect(component.getStatusClass('REGISTRATION_CLOSED')).toBe('bg-warning');
    });

    it('should return correct class for SCHEDULED status', () => {
      expect(component.getStatusClass('SCHEDULED')).toBe('bg-primary');
    });

    it('should return correct class for IN_PROGRESS status', () => {
      expect(component.getStatusClass('IN_PROGRESS')).toBe('bg-success');
    });

    it('should return correct class for PAUSED status', () => {
      expect(component.getStatusClass('PAUSED')).toBe('bg-warning');
    });

    it('should return correct class for FINISHED status', () => {
      expect(component.getStatusClass('FINISHED')).toBe('bg-dark');
    });

    it('should return correct class for CANCELLED status', () => {
      expect(component.getStatusClass('CANCELLED')).toBe('bg-danger');
    });

    it('should return default class for unknown status', () => {
      expect(component.getStatusClass('UNKNOWN')).toBe('bg-secondary');
    });
  });

  describe('getLabel', () => {
    it('should return label from options', () => {
      const result = component.getLabel(component.formats, 'LEAGUE');
      expect(result).toBe('Liga');
    });

    it('should return value if not found in options', () => {
      const result = component.getLabel(component.formats, 'UNKNOWN');
      expect(result).toBe('UNKNOWN');
    });

    it('should return correct category label', () => {
      const result = component.getLabel(component.categories, 'SUB_20');
      expect(result).toBe('Sub-20');
    });

    it('should return correct gender label', () => {
      const result = component.getLabel(component.genders, 'FEMALE');
      expect(result).toBe('Femenino');
    });

    it('should return correct football type label', () => {
      const result = component.getLabel(component.footballTypes, 'FUTSAL');
      expect(result).toBe('Futsal');
    });
  });

  describe('Form Validation', () => {
    it('should have invalid form when code is empty', () => {
      component.tournamentForm.controls['code'].setValue('');
      expect(component.tournamentForm.controls['code'].valid).toBeFalse();
    });

    it('should have invalid form when name is empty', () => {
      component.tournamentForm.controls['name'].setValue('');
      expect(component.tournamentForm.controls['name'].valid).toBeFalse();
    });

    it('should have invalid form when code is too short', () => {
      component.tournamentForm.controls['code'].setValue('A');
      expect(component.tournamentForm.controls['code'].valid).toBeFalse();
    });

    it('should have invalid form when name is too short', () => {
      component.tournamentForm.controls['name'].setValue('AB');
      expect(component.tournamentForm.controls['name'].valid).toBeFalse();
    });

    it('should have invalid form when code exceeds max length', () => {
      component.tournamentForm.controls['code'].setValue('A'.repeat(21));
      expect(component.tournamentForm.controls['code'].valid).toBeFalse();
    });

    it('should have invalid form when name exceeds max length', () => {
      component.tournamentForm.controls['name'].setValue('A'.repeat(101));
      expect(component.tournamentForm.controls['name'].valid).toBeFalse();
    });

    it('should have invalid form when seasonYear is below minimum', () => {
      component.tournamentForm.controls['seasonYear'].setValue(1999);
      expect(component.tournamentForm.controls['seasonYear'].valid).toBeFalse();
    });

    it('should have invalid form when seasonYear is above maximum', () => {
      component.tournamentForm.controls['seasonYear'].setValue(2101);
      expect(component.tournamentForm.controls['seasonYear'].valid).toBeFalse();
    });

    it('should have invalid form when minTeams is less than 2', () => {
      component.tournamentForm.controls['minTeams'].setValue(1);
      expect(component.tournamentForm.controls['minTeams'].valid).toBeFalse();
    });

    it('should have valid form when required fields are filled correctly', () => {
      component.tournamentForm.controls['code'].setValue('VALID');
      component.tournamentForm.controls['name'].setValue('Valid Tournament Name');
      component.tournamentForm.controls['format'].setValue('LEAGUE');
      component.tournamentForm.controls['category'].setValue('PRIMERA');
      component.tournamentForm.controls['gender'].setValue('MALE');
      component.tournamentForm.controls['footballType'].setValue('FOOTBALL_11');
      component.tournamentForm.controls['seasonYear'].setValue(2024);
      expect(component.tournamentForm.valid).toBeTrue();
    });

    it('should have valid edit form when name is filled', () => {
      component.editTournamentForm.controls['name'].setValue('Valid Tournament Name');
      expect(component.editTournamentForm.controls['name'].valid).toBeTrue();
    });

    it('should have invalid edit form when name is empty', () => {
      component.editTournamentForm.controls['name'].setValue('');
      expect(component.editTournamentForm.controls['name'].valid).toBeFalse();
    });
  });

  describe('Dropdown options', () => {
    it('should have format options', () => {
      expect(component.formats.length).toBeGreaterThan(0);
      expect(component.formats.some(f => f.value === 'LEAGUE')).toBeTrue();
    });

    it('should have status options', () => {
      expect(component.statuses.length).toBeGreaterThan(0);
      expect(component.statuses.some(s => s.value === 'DRAFT')).toBeTrue();
    });

    it('should have category options', () => {
      expect(component.categories.length).toBeGreaterThan(0);
      expect(component.categories.some(c => c.value === 'PRIMERA')).toBeTrue();
    });

    it('should have gender options', () => {
      expect(component.genders.length).toBe(3);
      expect(component.genders.some(g => g.value === 'MALE')).toBeTrue();
      expect(component.genders.some(g => g.value === 'FEMALE')).toBeTrue();
      expect(component.genders.some(g => g.value === 'MIXED')).toBeTrue();
    });

    it('should have football type options', () => {
      expect(component.footballTypes.length).toBeGreaterThan(0);
      expect(component.footballTypes.some(f => f.value === 'FOOTBALL_11')).toBeTrue();
    });

    it('should have tiebreaker options', () => {
      expect(component.tiebreakerOptions.length).toBeGreaterThan(0);
      expect(component.tiebreakerOptions.some(t => t.value === 'GOAL_DIFFERENCE')).toBeTrue();
    });
  });
});
