// API Response wrapper
export interface ApiResponse<T> {
  header: ApiHeader;
  body: ApiBody<T>;
}

export interface ApiHeader {
  success: boolean;
  statusCode: number;
  message: string;
}

export interface ApiBody<T> {
  pagination?: PaginationInfo;
  data: T;
}

export interface PaginationInfo {
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Role interfaces
export interface RoleResourceResponse {
  id: number;
  code: string;
  name: string;
}

export interface RoleResponse {
  id: number;
  name: string;
  description?: string;
  resources?: RoleResourceResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  description?: string;
}

// User interfaces
export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
}

// Resource interfaces
export type ResourceType = 'API' | 'VIEW';

export interface ResourceRoleResponse {
  id: number;
  name: string;
}

export interface ResourceResponse {
  id: number;
  code: string;
  name: string;
  type: ResourceType;
  roles?: ResourceRoleResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateResourceRequest {
  code: string;
  name: string;
  type: ResourceType;
}

export interface UpdateResourceRequest {
  name?: string;
  type?: ResourceType;
}

// Permission interfaces
export interface PermissionResponse {
  id: number;
  roleId: number;
  roleName: string;
  resourceId: number;
  resourceCode: string;
  resourceName: string;
  canCreate: boolean;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canExecute: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePermissionRequest {
  roleId: number;
  resourceId: number;
  canCreate: boolean;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canExecute: boolean;
}

// Menu interfaces
export interface MenuResponse {
  id: number;
  code: string;
  title: string;
  resourceId: number;
  resourceCode?: string;
  resourceName?: string;
  path?: string;
  iconType?: string;
  icon?: string;
  className?: string;
  groupTitle?: boolean;
  groupName?: string;
  badge?: string;
  badgeClass?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMenuRequest {
  code: string;
  title: string;
  resourceId: number;
  path?: string;
  iconType?: string;
  icon?: string;
  className?: string;
  groupTitle?: boolean;
  groupName?: string;
  badge?: string;
  badgeClass?: string;
  displayOrder?: number;
}

export interface UpdateMenuRequest {
  title: string;
  resourceId: number;
  path?: string;
  iconType?: string;
  icon?: string;
  className?: string;
  groupTitle?: boolean;
  groupName?: string;
  badge?: string;
  badgeClass?: string;
}

// MenuItem interfaces
export interface MenuItemResponse {
  id: number;
  menuId: number;
  menuCode?: string;
  parentId?: number;
  resourceId?: number;
  resourceCode?: string;
  title: string;
  icon?: string;
  path?: string;
  iconType?: string;
  className?: string;
  groupTitle?: boolean;
  badge?: string;
  badgeClass?: string;
  displayOrder: number;
  children?: MenuItemResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMenuItemRequest {
  menuId: number;
  parentId?: number;
  resourceId?: number;
  title: string;
  icon?: string;
  path?: string;
  iconType?: string;
  className?: string;
  groupTitle?: boolean;
  badge?: string;
  badgeClass?: string;
  displayOrder: number;
}

export interface UpdateMenuItemRequest {
  parentId?: number;
  resourceId?: number;
  title?: string;
  icon?: string;
  path?: string;
  iconType?: string;
  className?: string;
  groupTitle?: boolean;
  badge?: string;
  badgeClass?: string;
  displayOrder?: number;
}

// Club interfaces
export interface AddressDto {
  street?: string;
  number?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface ContactInfoDto {
  email?: string;
  phone?: string;
  mobile?: string;
  contactPerson?: string;
}

export interface ClubResponse {
  id: number;
  name: string;
  code: string;
  shortName?: string;
  foundationDate?: string;
  logoUrl?: string;
  address?: AddressDto;
  contactInfo?: ContactInfoDto;
  colors?: string;
  stadiumName?: string;
  stadiumCapacity?: number;
  website?: string;
  description?: string;
  taxId?: string;
  legalRepresentative?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClubRequest {
  name: string;
  code: string;
  shortName?: string;
  foundationDate?: string;
  logoUrl?: string;
  address?: AddressDto;
  contactInfo?: ContactInfoDto;
  colors?: string;
  stadiumName?: string;
  stadiumCapacity?: number;
  website?: string;
  description?: string;
  taxId?: string;
  legalRepresentative?: string;
}

export interface UpdateClubRequest {
  name?: string;
  shortName?: string;
  foundationDate?: string;
  logoUrl?: string;
  address?: AddressDto;
  contactInfo?: ContactInfoDto;
  colors?: string;
  stadiumName?: string;
  stadiumCapacity?: number;
  website?: string;
  description?: string;
  taxId?: string;
  legalRepresentative?: string;
}

// Team enums
export type Category = 'SUB_8' | 'SUB_10' | 'SUB_12' | 'SUB_14' | 'SUB_15' | 'SUB_16' | 'SUB_17' | 'SUB_18' | 'SUB_19' | 'SUB_20' | 'SUB_21' | 'SUB_23' | 'PRIMERA' | 'RESERVA' | 'SENIOR' | 'MASTER' | 'SUPER_MASTER' | 'LIBRE';
export type Gender = 'MALE' | 'FEMALE' | 'MIXED';
export type FootballType = 'FOOTBALL_11' | 'FOOTBALL_9' | 'FOOTBALL_8' | 'FOOTBALL_7' | 'FOOTBALL_6' | 'FOOTBALL_5' | 'FUTSAL' | 'BEACH_SOCCER';
export type TeamStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DISSOLVED';

// Team interfaces
export interface TeamResponse {
  id: number;
  clubId: number;
  clubName?: string;
  clubCode?: string;
  name: string;
  code: string;
  fullName?: string;
  category: Category;
  gender: Gender;
  footballType: FootballType;
  seasonYear: number;
  status: TeamStatus;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  homeVenue?: string;
  description?: string;
  maxPlayers?: number;
  minPlayers?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeamRequest {
  clubId: number;
  name: string;
  code: string;
  category: Category;
  gender: Gender;
  footballType: FootballType;
  seasonYear: number;
  status: TeamStatus;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  homeVenue?: string;
  description?: string;
  maxPlayers?: number;
  minPlayers?: number;
}

export interface UpdateTeamRequest {
  name?: string;
  category?: Category;
  gender?: Gender;
  footballType?: FootballType;
  seasonYear?: number;
  status?: TeamStatus;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  homeVenue?: string;
  description?: string;
  maxPlayers?: number;
  minPlayers?: number;
}

// StaffMember enums
export type StaffRole = 'HEAD_COACH' | 'ASSISTANT_COACH' | 'GOALKEEPER_COACH' | 'FITNESS_COACH' | 'TEAM_MANAGER' | 'TEAM_DOCTOR' | 'PHYSIOTHERAPIST' | 'ANALYST' | 'EQUIPMENT_MANAGER';

// StaffMember interfaces
export interface StaffMemberResponse {
  id: number;
  teamId: number;
  teamName?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  documentType?: string;
  documentNumber?: string;
  birthDate?: string;
  nationality?: string;
  role: StaffRole;
  roleDisplayName?: string;
  licenseNumber?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  startDate?: string;
  endDate?: string;
  currentlyActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStaffMemberRequest {
  teamId: number;
  firstName: string;
  lastName: string;
  documentType?: string;
  documentNumber?: string;
  birthDate?: string;
  nationality?: string;
  role: StaffRole;
  licenseNumber?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateStaffMemberRequest {
  firstName?: string;
  lastName?: string;
  documentType?: string;
  documentNumber?: string;
  birthDate?: string;
  nationality?: string;
  role?: StaffRole;
  licenseNumber?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  startDate?: string;
  endDate?: string;
}

// Player enums
export type DocumentType = 'CI' | 'PASSPORT' | 'DNI' | 'FOREIGN_ID' | 'OTHER';
export type FootPreference = 'RIGHT' | 'LEFT' | 'BOTH';
export type Position =
  | 'GOALKEEPER'
  | 'CENTER_BACK'
  | 'LEFT_BACK'
  | 'RIGHT_BACK'
  | 'SWEEPER'
  | 'DEFENSIVE_MIDFIELDER'
  | 'CENTRAL_MIDFIELDER'
  | 'ATTACKING_MIDFIELDER'
  | 'LEFT_MIDFIELDER'
  | 'RIGHT_MIDFIELDER'
  | 'LEFT_WINGER'
  | 'RIGHT_WINGER'
  | 'CENTER_FORWARD'
  | 'STRIKER'
  | 'SECOND_STRIKER';
export type PlayerStatus = 'ACTIVE' | 'INJURED' | 'SUSPENDED' | 'ON_LOAN' | 'INACTIVE' | 'TRANSFERRED';

// Player interfaces (personal data)
export interface PlayerResponse {
  id: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  documentType: DocumentType;
  documentTypeDisplayName?: string;
  documentNumber: string;
  birthDate: string;
  age?: number;
  birthPlace?: string;
  nationality: string;
  secondNationality?: string;
  gender: string;
  height?: number;
  weight?: number;
  footPreference?: FootPreference;
  footPreferenceDisplayName?: string;
  primaryPosition?: Position;
  primaryPositionDisplayName?: string;
  secondaryPosition?: Position;
  secondaryPositionDisplayName?: string;
  email?: string;
  phone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  bloodType?: string;
  medicalNotes?: string;
  allergies?: string;
  photoUrl?: string;
  isMinor?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePlayerRequest {
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string;
  birthPlace?: string;
  nationality: string;
  secondNationality?: string;
  gender: string;
  height?: number;
  weight?: number;
  footPreference?: FootPreference;
  primaryPosition?: Position;
  secondaryPosition?: Position;
  email?: string;
  phone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  bloodType?: string;
  medicalNotes?: string;
  allergies?: string;
  photoUrl?: string;
}

export interface UpdatePlayerRequest {
  firstName?: string;
  lastName?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  birthDate?: string;
  birthPlace?: string;
  nationality?: string;
  secondNationality?: string;
  gender?: string;
  height?: number;
  weight?: number;
  footPreference?: FootPreference;
  primaryPosition?: Position;
  secondaryPosition?: Position;
  email?: string;
  phone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  bloodType?: string;
  medicalNotes?: string;
  allergies?: string;
  photoUrl?: string;
}

// Player Registration interfaces (player-team relationship)
export interface PlayerRegistrationResponse {
  id: number;
  playerId: number;
  playerFullName?: string;
  teamId: number;
  teamName?: string;
  seasonYear: number;
  jerseyNumber?: number;
  position?: Position;
  positionDisplayName?: string;
  status: PlayerStatus;
  statusDisplayName?: string;
  registrationDate: string;
  endDate?: string;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  contractStart?: string;
  contractEnd?: string;
  onLoanFrom?: string;
  loanEndDate?: string;
  notes?: string;
  isCurrentlyActive?: boolean;
  isOnLoan?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePlayerRegistrationRequest {
  playerId: number;
  teamId: number;
  seasonYear: number;
  jerseyNumber?: number;
  position?: Position;
  status: PlayerStatus;
  registrationDate: string;
  endDate?: string;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  contractStart?: string;
  contractEnd?: string;
  onLoanFrom?: string;
  loanEndDate?: string;
  notes?: string;
}

export interface UpdatePlayerRegistrationRequest {
  jerseyNumber?: number;
  position?: Position;
  status?: PlayerStatus;
  endDate?: string;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  contractStart?: string;
  contractEnd?: string;
  onLoanFrom?: string;
  loanEndDate?: string;
  notes?: string;
}

// ==================== Tournament Types ====================

export type TournamentStatus =
  | 'DRAFT'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'FINISHED'
  | 'CANCELLED';

export type TournamentFormat =
  | 'LEAGUE'
  | 'SINGLE_ELIMINATION'
  | 'DOUBLE_ELIMINATION'
  | 'GROUP_STAGE'
  | 'GROUP_STAGE_SINGLE'
  | 'GROUP_STAGE_DOUBLE'
  | 'ROUND_ROBIN'
  | 'SWISS'
  | 'PLAYOFF';

export type RegistrationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'DISQUALIFIED';

export type TiebreakerCriteria =
  | 'GOAL_DIFFERENCE'
  | 'GOALS_SCORED'
  | 'HEAD_TO_HEAD'
  | 'AWAY_GOALS'
  | 'FAIR_PLAY'
  | 'DRAW'
  | 'EXTRA_TIME'
  | 'PENALTIES';

export interface TournamentRulesDto {
  pointsForWin?: number;
  pointsForDraw?: number;
  pointsForLoss?: number;
  yellowCardsForSuspension?: number;
  redCardSuspensionMatches?: number;
  maxPlayersPerTeam?: number;
  minPlayersPerTeam?: number;
  maxForeignPlayers?: number;
  substitutionsAllowed?: number;
  matchDurationMinutes?: number;
  halfTimeDurationMinutes?: number;
  extraTimeDurationMinutes?: number;
  allowsExtraTime?: boolean;
  allowsPenalties?: boolean;
  homeAndAway?: boolean;
  firstTiebreaker?: TiebreakerCriteria;
  secondTiebreaker?: TiebreakerCriteria;
  thirdTiebreaker?: TiebreakerCriteria;
  firstTiebreakerDisplayName?: string;
  secondTiebreakerDisplayName?: string;
  thirdTiebreakerDisplayName?: string;
}

export interface TournamentResponse {
  id: number;
  name: string;
  code: string;
  shortName?: string;
  description?: string;
  format: TournamentFormat;
  status: TournamentStatus;
  category: Category;
  gender: Gender;
  footballType: FootballType;
  seasonYear: number;
  startDate?: string;
  endDate?: string;
  registrationStart?: string;
  registrationEnd?: string;
  maxTeams?: number;
  minTeams?: number;
  logoUrl?: string;
  organizer?: string;
  location?: string;
  prizeDescription?: string;
  rules?: TournamentRulesDto;
  registeredTeamsCount?: number;
  approvedTeamsCount?: number;
  isRegistrationOpen?: boolean;
  createdAt?: string;
  updatedAt?: string;
  formatDisplayName?: string;
  statusDisplayName?: string;
  categoryDisplayName?: string;
  genderDisplayName?: string;
  footballTypeDisplayName?: string;
}

export interface TournamentSummaryResponse {
  id: number;
  name: string;
  code: string;
  shortName?: string;
  format: TournamentFormat;
  status: TournamentStatus;
  category: Category;
  gender: Gender;
  footballType: FootballType;
  seasonYear: number;
  startDate?: string;
  endDate?: string;
  logoUrl?: string;
  registeredTeamsCount?: number;
  approvedTeamsCount?: number;
  isRegistrationOpen?: boolean;
  formatDisplayName?: string;
  statusDisplayName?: string;
  categoryDisplayName?: string;
  genderDisplayName?: string;
  footballTypeDisplayName?: string;
}

export interface TournamentTeamResponse {
  id: number;
  tournamentId: number;
  tournamentName?: string;
  teamId: number;
  teamName?: string;
  teamCode?: string;
  clubName?: string;
  status: RegistrationStatus;
  registrationDate?: string;
  approvalDate?: string;
  seed?: number;
  registrationNumber?: number;
  rejectionReason?: string;
  withdrawalReason?: string;
  notes?: string;
  totalPlayed?: number;
  totalWon?: number;
  totalDrawn?: number;
  totalLost?: number;
  totalGoalsFor?: number;
  totalGoalsAgainst?: number;
  totalGoalDifference?: number;
  finalPosition?: number;
  isChampion?: boolean;
  createdAt?: string;
  updatedAt?: string;
  statusDisplayName?: string;
}

export interface CreateTournamentRequest {
  name: string;
  code: string;
  shortName?: string;
  description?: string;
  format: TournamentFormat;
  category: Category;
  gender: Gender;
  footballType: FootballType;
  seasonYear: number;
  startDate?: string;
  endDate?: string;
  registrationStart?: string;
  registrationEnd?: string;
  maxTeams?: number;
  minTeams?: number;
  logoUrl?: string;
  organizer?: string;
  location?: string;
  prizeDescription?: string;
  rules?: TournamentRulesDto;
}

export interface UpdateTournamentRequest {
  name: string;
  shortName?: string;
  description?: string;
  format?: TournamentFormat;
  category?: Category;
  gender?: Gender;
  footballType?: FootballType;
  seasonYear?: number;
  startDate?: string;
  endDate?: string;
  registrationStart?: string;
  registrationEnd?: string;
  maxTeams?: number;
  minTeams?: number;
  logoUrl?: string;
  organizer?: string;
  location?: string;
  prizeDescription?: string;
  rules?: TournamentRulesDto;
}

export interface RegisterTeamRequest {
  teamId: number;
  notes?: string;
}

export interface RejectTeamRequest {
  reason: string;
}

// ==================== Standing Types ====================

export interface StandingResponse {
  id: number;
  tournamentId: number;
  tournamentName?: string;
  teamId: number;
  teamName?: string;
  teamCode?: string;
  teamLogoUrl?: string;
  position?: number;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number;
  points?: number;
  homePlayed?: number;
  homeWon?: number;
  homeDrawn?: number;
  homeLost?: number;
  homeGoalsFor?: number;
  homeGoalsAgainst?: number;
  homeGoalDifference?: number;
  awayPlayed?: number;
  awayWon?: number;
  awayDrawn?: number;
  awayLost?: number;
  awayGoalsFor?: number;
  awayGoalsAgainst?: number;
  awayGoalDifference?: number;
  form?: string;
  currentStreak?: number;
  streakType?: string;
  yellowCards?: number;
  redCards?: number;
  fairPlayPoints?: number;
  qualified?: boolean;
  relegated?: boolean;
  promotionPlayoff?: boolean;
  relegationPlayoff?: boolean;
  pointsPerGame?: number;
  goalsPerGame?: number;
  goalsAgainstPerGame?: number;
  winPercentage?: number;
  updatedAt?: string;
}

export interface StandingSummaryResponse {
  id: number;
  position?: number;
  teamId: number;
  teamName?: string;
  teamCode?: string;
  teamLogoUrl?: string;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number;
  points?: number;
  form?: string;
  qualified?: boolean;
  relegated?: boolean;
}

export interface StandingTableResponse {
  tournamentId: number;
  tournamentName?: string;
  standings: StandingSummaryResponse[];
  lastUpdated?: string;
}

// ==================== Player Statistics Types ====================

export interface PlayerStatisticsResponse {
  id: number;
  tournamentId: number;
  tournamentName?: string;
  playerId: number;
  playerName?: string;
  playerPhotoUrl?: string;
  playerPosition?: string;
  teamId: number;
  teamName?: string;
  teamLogoUrl?: string;
  matchesPlayed?: number;
  matchesStarted?: number;
  minutesPlayed?: number;
  goals?: number;
  assists?: number;
  goalContributions?: number;
  penaltyGoals?: number;
  penaltyMissed?: number;
  ownGoals?: number;
  yellowCards?: number;
  redCards?: number;
  secondYellowCards?: number;
  totalCards?: number;
  cleanSheets?: number;
  goalsConceded?: number;
  saves?: number;
  penaltiesSaved?: number;
  goalsRank?: number;
  assistsRank?: number;
  manOfTheMatch?: number;
  goalsPerGame?: number;
  assistsPerGame?: number;
  minutesPerGoal?: number;
  updatedAt?: string;
}

export interface TopScorerResponse {
  rank?: number;
  playerId: number;
  playerName?: string;
  playerPhotoUrl?: string;
  teamId: number;
  teamName?: string;
  teamLogoUrl?: string;
  goals?: number;
  penaltyGoals?: number;
  assists?: number;
  matchesPlayed?: number;
  goalsPerGame?: number;
}

export interface TopAssistResponse {
  rank?: number;
  playerId: number;
  playerName?: string;
  playerPhotoUrl?: string;
  teamId: number;
  teamName?: string;
  teamLogoUrl?: string;
  assists?: number;
  goals?: number;
  matchesPlayed?: number;
  assistsPerGame?: number;
}

export interface TopContributorResponse {
  rank?: number;
  playerId: number;
  playerName?: string;
  playerPhotoUrl?: string;
  teamId: number;
  teamName?: string;
  teamLogoUrl?: string;
  goals?: number;
  assists?: number;
  contributions?: number;
  matchesPlayed?: number;
}

export interface TopCleanSheetResponse {
  rank?: number;
  playerId: number;
  playerName?: string;
  playerPhotoUrl?: string;
  teamId: number;
  teamName?: string;
  teamLogoUrl?: string;
  cleanSheets?: number;
  goalsConceded?: number;
  matchesPlayed?: number;
}

export interface CardStatsResponse {
  rank?: number;
  playerId: number;
  playerName?: string;
  playerPhotoUrl?: string;
  teamId: number;
  teamName?: string;
  teamLogoUrl?: string;
  yellowCards?: number;
  redCards?: number;
  secondYellowCards?: number;
  totalCards?: number;
  matchesPlayed?: number;
}

export interface ScorerTableResponse {
  tournamentId: number;
  tournamentName?: string;
  scorers: TopScorerResponse[];
  lastUpdated?: string;
}

export interface AssistTableResponse {
  tournamentId: number;
  tournamentName?: string;
  assists: TopAssistResponse[];
  lastUpdated?: string;
}
