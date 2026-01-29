import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import {
  TournamentService,
  TournamentResponse,
  TournamentFormat,
  PhaseConfigRequest,
  QualificationRuleRequest,
  PhaseMode,
  PhaseType,
  QualificationRuleType,
  UpdateTournamentRequest,
} from '@core';

@Component({
  selector: 'app-tournament-format-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
  ],
  templateUrl: './tournament-format-config.component.html',
  styleUrls: ['./tournament-format-config.component.scss'],
})
export class TournamentFormatConfigComponent implements OnInit {
  tournamentId!: number;
  tournament: TournamentResponse | null = null;
  loading = false;
  saving = false;

  // Form
  formatConfigForm!: UntypedFormGroup;

  // Format options
  formats: { value: TournamentFormat; label: string; icon: string; description: string }[] = [
    { value: 'LEAGUE', label: 'Liga', icon: 'fa-list-ol', description: 'Todos contra todos, se acumulan puntos' },
    { value: 'SINGLE_ELIMINATION', label: 'Eliminacion Simple', icon: 'fa-sitemap', description: 'Pierde y queda eliminado' },
    { value: 'DOUBLE_ELIMINATION', label: 'Eliminacion Doble', icon: 'fa-code-branch', description: 'Dos derrotas para ser eliminado' },
    { value: 'GROUP_STAGE', label: 'Fase de Grupos', icon: 'fa-th', description: 'Grupos clasificatorios' },
    { value: 'GROUP_STAGE_SINGLE', label: 'Grupos + Eliminacion Simple', icon: 'fa-layer-group', description: 'Grupos y luego eliminacion directa' },
    { value: 'GROUP_STAGE_DOUBLE', label: 'Grupos + Eliminacion Doble', icon: 'fa-project-diagram', description: 'Grupos y luego doble eliminacion' },
    { value: 'SWISS', label: 'Sistema Suizo', icon: 'fa-chess', description: 'Emparejamiento por rendimiento' },
  ];

  // Phase configuration options
  phaseModes: { value: PhaseMode; label: string }[] = [
    { value: 'KNOCKOUT', label: 'Eliminacion Directa' },
    { value: 'ROUND_ROBIN', label: 'Todos contra Todos' },
    { value: 'GROUP_STAGE', label: 'Fase de Grupos' },
  ];

  phaseTypes: { value: PhaseType; label: string }[] = [
    { value: 'GROUP_STAGE', label: 'Fase de Grupos' },
    { value: 'ROUND_OF_32', label: 'Dieciseisavos de Final' },
    { value: 'ROUND_OF_16', label: 'Octavos de Final' },
    { value: 'QUARTER_FINALS', label: 'Cuartos de Final' },
    { value: 'SEMI_FINALS', label: 'Semifinales' },
    { value: 'THIRD_PLACE', label: 'Tercer Puesto' },
    { value: 'FINAL', label: 'Final' },
    { value: 'REGULAR_PHASE', label: 'Fase Regular' },
    { value: 'SPLIT_PHASE', label: 'Fase de Division' },
  ];

  qualificationRuleTypes: { value: QualificationRuleType; label: string }[] = [
    { value: 'TOP_N_ADVANCE', label: 'Primeros N Avanzan' },
    { value: 'POSITION_RANGE_TO_GROUP', label: 'Rango de Posiciones a Grupo' },
    { value: 'KNOCKOUT_CROSS', label: 'Cruce Eliminatorio' },
    { value: 'DIRECT_TO_FINAL', label: 'Directo a Final' },
    { value: 'TO_THIRD_PLACE', label: 'A Tercer Puesto' },
    { value: 'WINNERS_ADVANCE', label: 'Ganadores Avanzan' },
  ];

  // Phases configuration
  useAdvancedPhases = false;
  phases: PhaseConfigRequest[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tournamentService: TournamentService,
    private fb: UntypedFormBuilder,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.tournamentId = +params['tournamentId'];
      this.loadTournament();
    });
  }

  private initForm(): void {
    this.formatConfigForm = this.fb.group({
      format: ['LEAGUE', [Validators.required]],
    });
  }

  loadTournament(): void {
    this.loading = true;
    this.tournamentService.getById(this.tournamentId).subscribe({
      next: (response) => {
        this.tournament = response.body.data;
        if (this.tournament.format) {
          this.formatConfigForm.patchValue({ format: this.tournament.format });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tournament:', error);
        this.toastr.error(this.translate.instant('COMMON.ERROR_LOADING'));
        this.loading = false;
        this.router.navigate(['/tournaments/list']);
      },
    });
  }

  selectFormat(format: TournamentFormat): void {
    this.formatConfigForm.patchValue({ format });
  }

  isFormatSelected(format: TournamentFormat): boolean {
    return this.formatConfigForm.get('format')?.value === format;
  }

  showAdvancedConfig(): boolean {
    const format = this.formatConfigForm.get('format')?.value;
    return ['GROUP_STAGE', 'GROUP_STAGE_SINGLE', 'GROUP_STAGE_DOUBLE'].includes(format);
  }

  // Toggle advanced phases mode
  toggleAdvancedPhases(): void {
    this.useAdvancedPhases = !this.useAdvancedPhases;
    if (this.useAdvancedPhases && this.phases.length === 0) {
      this.addPhase();
    }
  }

  // Add a new phase
  addPhase(): void {
    const newPhase: PhaseConfigRequest = {
      phaseOrder: this.phases.length + 1,
      phaseMode: 'ROUND_ROBIN',
      customName: '',
      isHomeAndAway: true,
      qualificationRules: [],
    };
    this.phases.push(newPhase);
  }

  // Remove a phase
  removePhase(index: number): void {
    this.phases.splice(index, 1);
    this.phases.forEach((phase, i) => {
      phase.phaseOrder = i + 1;
    });
  }

  // Add qualification rule to a phase
  addQualificationRule(phaseIndex: number): void {
    if (!this.phases[phaseIndex].qualificationRules) {
      this.phases[phaseIndex].qualificationRules = [];
    }
    const newRule: QualificationRuleRequest = {
      ruleOrder: (this.phases[phaseIndex].qualificationRules?.length || 0) + 1,
      ruleType: 'TOP_N_ADVANCE',
    };
    this.phases[phaseIndex].qualificationRules!.push(newRule);
  }

  // Remove qualification rule from a phase
  removeQualificationRule(phaseIndex: number, ruleIndex: number): void {
    this.phases[phaseIndex].qualificationRules?.splice(ruleIndex, 1);
    this.phases[phaseIndex].qualificationRules?.forEach((rule, i) => {
      rule.ruleOrder = i + 1;
    });
  }

  // Check if phase mode requires groups configuration
  requiresGroupConfig(phaseMode: PhaseMode): boolean {
    return phaseMode === 'GROUP_STAGE';
  }

  // Check if rule type requires position range
  requiresPositionRange(ruleType: QualificationRuleType): boolean {
    return ruleType === 'TOP_N_ADVANCE' || ruleType === 'POSITION_RANGE_TO_GROUP';
  }

  // Check if rule type requires target group
  requiresTargetGroup(ruleType: QualificationRuleType): boolean {
    return ruleType === 'POSITION_RANGE_TO_GROUP';
  }

  onSave(): void {
    if (this.formatConfigForm.invalid || !this.tournament) {
      return;
    }

    this.saving = true;
    const formValue = this.formatConfigForm.value;

    const request: UpdateTournamentRequest = {
      name: this.tournament.name,
      format: formValue.format,
      category: this.tournament.category,
      gender: this.tournament.gender,
      footballType: this.tournament.footballType,
      seasonYear: this.tournament.seasonYear,
    };

    this.tournamentService.update(this.tournamentId, request).subscribe({
      next: (response) => {
        this.toastr.success(this.translate.instant('COMMON.SAVED_SUCCESSFULLY'));
        this.saving = false;
      },
      error: (error) => {
        const errorMessage = typeof error === 'string' ? error : (error.message || 'Error saving format');
        this.toastr.error(errorMessage);
        this.saving = false;
      },
    });
  }

  onSaveAndContinue(): void {
    if (this.formatConfigForm.invalid || !this.tournament) {
      return;
    }

    this.saving = true;
    const formValue = this.formatConfigForm.value;

    const request: UpdateTournamentRequest = {
      name: this.tournament.name,
      format: formValue.format,
      category: this.tournament.category,
      gender: this.tournament.gender,
      footballType: this.tournament.footballType,
      seasonYear: this.tournament.seasonYear,
    };

    this.tournamentService.update(this.tournamentId, request).subscribe({
      next: (response) => {
        this.toastr.success(this.translate.instant('COMMON.SAVED_SUCCESSFULLY'));
        this.saving = false;
        this.router.navigate(['/tournaments', this.tournamentId]);
      },
      error: (error) => {
        const errorMessage = typeof error === 'string' ? error : (error.message || 'Error saving format');
        this.toastr.error(errorMessage);
        this.saving = false;
      },
    });
  }

  goBack(): void {
    if (this.tournament) {
      this.router.navigate(['/tournaments', this.tournamentId]);
    } else {
      this.router.navigate(['/tournaments/list']);
    }
  }
}
