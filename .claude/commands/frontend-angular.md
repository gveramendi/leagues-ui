Desarrolla en frontend Angular: $ARGUMENTS

## Pasos
1. Service en core/services/
2. Models/interfaces en core/models/
3. Componente si aplica

## Tests obligatorios (Jasmine)

### Service Test
```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('NombreService', () => {
  let service: NombreService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NombreService]
    });
    service = TestBed.inject(NombreService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe obtener datos', () => {
    const mockData = [...];
    
    service.getData().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/endpoint');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
```

### Component Test
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('NombreComponent', () => {
  let component: NombreComponent;
  let fixture: ComponentFixture<NombreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NombreComponent],
      providers: [
        { provide: NombreService, useValue: jasmine.createSpyObj('NombreService', ['metodo']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NombreComponent);
    component = fixture.componentInstance;
  });

  it('debe crear', () => {
    expect(component).toBeTruthy();
  });
});
```

## Ejecutar
ng test --include=**/nombre.spec.ts
