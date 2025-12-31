import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ResourceService } from './resource.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreateResourceRequest,
  ResourceResponse,
  UpdateResourceRequest,
} from '../models/response';

describe('ResourceService', () => {
  let service: ResourceService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/resources`;

  const mockResource: ResourceResponse = {
    id: 1,
    code: 'USERS_VIEW',
    name: 'Users View',
    type: 'VIEW',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ResourceService],
    });
    service = TestBed.inject(ResourceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return all resources wrapped in ApiResponse', () => {
      const mockResponse: ApiResponse<ResourceResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Resources retrieved successfully',
        },
        body: {
          data: [mockResource, { ...mockResource, id: 2, code: 'USERS_API', type: 'API' }],
        },
      };

      service.getAll().subscribe((response) => {
        expect(response.body.data.length).toBe(2);
        expect(response.header.message).toBe('Resources retrieved successfully');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should return a resource by id wrapped in ApiResponse', () => {
      const mockResponse: ApiResponse<ResourceResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Resource retrieved successfully',
        },
        body: {
          data: mockResource,
        },
      };

      service.getById(1).subscribe((response) => {
        expect(response.body.data).toEqual(mockResource);
        expect(response.header.message).toBe('Resource retrieved successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByCode', () => {
    it('should return a resource by code wrapped in ApiResponse', () => {
      const mockResponse: ApiResponse<ResourceResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Resource retrieved successfully',
        },
        body: {
          data: mockResource,
        },
      };

      service.getByCode('USERS_VIEW').subscribe((response) => {
        expect(response.body.data).toEqual(mockResource);
        expect(response.body.data.code).toBe('USERS_VIEW');
      });

      const req = httpMock.expectOne(`${apiUrl}/code/USERS_VIEW`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('create', () => {
    it('should create a new resource', () => {
      const createRequest: CreateResourceRequest = {
        code: 'NEW_RESOURCE',
        name: 'New Resource',
        type: 'API',
      };
      const mockResponse: ApiResponse<ResourceResponse> = {
        header: {
          success: true,
          statusCode: 201,
          message: 'Resource created successfully',
        },
        body: {
          data: { ...mockResource, id: 3, code: 'NEW_RESOURCE', name: 'New Resource', type: 'API' },
        },
      };

      service.create(createRequest).subscribe((response) => {
        expect(response.body.data.code).toBe('NEW_RESOURCE');
        expect(response.header.message).toBe('Resource created successfully');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing resource', () => {
      const updateRequest: UpdateResourceRequest = {
        name: 'Updated Resource Name',
        type: 'API',
      };
      const mockResponse: ApiResponse<ResourceResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Resource updated successfully',
        },
        body: {
          data: { ...mockResource, name: 'Updated Resource Name', type: 'API' },
        },
      };

      service.update(1, updateRequest).subscribe((response) => {
        expect(response.body.data.name).toBe('Updated Resource Name');
        expect(response.header.message).toBe('Resource updated successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a resource', () => {
      const mockResponse: ApiResponse<void> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Resource deleted successfully',
        },
        body: {
          data: undefined as unknown as void,
        },
      };

      service.delete(1).subscribe((response) => {
        expect(response.header.message).toBe('Resource deleted successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('existsByCode', () => {
    it('should return true if resource code exists', () => {
      const mockResponse: ApiResponse<boolean> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Success',
        },
        body: {
          data: true,
        },
      };

      service.existsByCode('USERS_VIEW').subscribe((response) => {
        expect(response.body.data).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/exists/USERS_VIEW`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return false if resource code does not exist', () => {
      const mockResponse: ApiResponse<boolean> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Success',
        },
        body: {
          data: false,
        },
      };

      service.existsByCode('NON_EXISTENT').subscribe((response) => {
        expect(response.body.data).toBeFalse();
      });

      const req = httpMock.expectOne(`${apiUrl}/exists/NON_EXISTENT`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
