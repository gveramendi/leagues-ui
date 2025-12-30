import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { UserService } from './user.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '../models/response';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/users`;

  const mockUser: UserResponse = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    roles: ['ROLE_USER'],
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return all users wrapped in ApiResponse', () => {
      const mockResponse: ApiResponse<UserResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Users retrieved successfully',
        },
        body: {
          data: [mockUser, { ...mockUser, id: 2, email: 'jane.doe@example.com' }],
        },
      };

      service.getAll().subscribe((response) => {
        expect(response.body.data.length).toBe(2);
        expect(response.header.message).toBe('Users retrieved successfully');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should return a user by id wrapped in ApiResponse', () => {
      const mockResponse: ApiResponse<UserResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'User retrieved successfully',
        },
        body: {
          data: mockUser,
        },
      };

      service.getById(1).subscribe((response) => {
        expect(response.body.data).toEqual(mockUser);
        expect(response.header.message).toBe('User retrieved successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByEmail', () => {
    it('should return a user by email wrapped in ApiResponse', () => {
      const mockResponse: ApiResponse<UserResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'User retrieved successfully',
        },
        body: {
          data: mockUser,
        },
      };

      service.getByEmail('john.doe@example.com').subscribe((response) => {
        expect(response.body.data).toEqual(mockUser);
        expect(response.body.data.email).toBe('john.doe@example.com');
      });

      const req = httpMock.expectOne(`${apiUrl}/email/john.doe@example.com`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('searchUsers', () => {
    const mockSearchResponse: ApiResponse<UserResponse[]> = {
      header: {
        success: true,
        statusCode: 200,
        message: 'Success',
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
        data: [mockUser, { ...mockUser, id: 2, email: 'jane.doe@example.com' }],
      },
    };

    it('should search users with default parameters', () => {
      service.searchUsers().subscribe((response) => {
        expect(response.body.data.length).toBe(2);
        expect(response.body.pagination?.totalElements).toBe(2);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/search` &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '10' &&
        request.params.get('sort') === 'firstName,asc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSearchResponse);
    });

    it('should search users with custom parameters', () => {
      service.searchUsers('john', 1, 20, 'lastName,desc').subscribe((response) => {
        expect(response.body.data.length).toBe(2);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/search` &&
        request.params.get('search') === 'john' &&
        request.params.get('page') === '1' &&
        request.params.get('size') === '20' &&
        request.params.get('sort') === 'lastName,desc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSearchResponse);
    });

    it('should not include search param when search is empty', () => {
      service.searchUsers('', 0, 10, 'firstName,asc').subscribe();

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/search` && !request.params.has('search')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSearchResponse);
    });
  });

  describe('create', () => {
    it('should create a new user', () => {
      const createRequest: CreateUserRequest = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
      };
      const mockResponse: ApiResponse<UserResponse> = {
        header: {
          success: true,
          statusCode: 201,
          message: 'User created successfully',
        },
        body: {
          data: { ...mockUser, id: 3, firstName: 'Jane', email: 'jane.doe@example.com' },
        },
      };

      service.create(createRequest).subscribe((response) => {
        expect(response.body.data.email).toBe('jane.doe@example.com');
        expect(response.header.message).toBe('User created successfully');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing user', () => {
      const updateRequest: UpdateUserRequest = {
        firstName: 'Johnny',
        lastName: 'Updated',
      };
      const mockResponse: ApiResponse<UserResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'User updated successfully',
        },
        body: {
          data: { ...mockUser, firstName: 'Johnny', lastName: 'Updated' },
        },
      };

      service.update(1, updateRequest).subscribe((response) => {
        expect(response.body.data.firstName).toBe('Johnny');
        expect(response.body.data.lastName).toBe('Updated');
        expect(response.header.message).toBe('User updated successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a user', () => {
      const mockResponse: ApiResponse<void> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'User deleted successfully',
        },
        body: {
          data: undefined as unknown as void,
        },
      };

      service.delete(1).subscribe((response) => {
        expect(response.header.message).toBe('User deleted successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('existsByEmail', () => {
    it('should return true if user email exists', () => {
      service.existsByEmail('john.doe@example.com').subscribe((exists) => {
        expect(exists).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/exists/john.doe@example.com`);
      expect(req.request.method).toBe('GET');
      req.flush(true);
    });

    it('should return false if user email does not exist', () => {
      service.existsByEmail('nonexistent@example.com').subscribe((exists) => {
        expect(exists).toBeFalse();
      });

      const req = httpMock.expectOne(`${apiUrl}/exists/nonexistent@example.com`);
      expect(req.request.method).toBe('GET');
      req.flush(false);
    });
  });
});
