import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserHomeComponent } from './user-home.component';

describe('UserHomeComponent', () => {
  let component: UserHomeComponent;
  let fixture: ComponentFixture<UserHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserHomeComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UserHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
