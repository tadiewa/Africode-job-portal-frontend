import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperDashboard } from './developer-dashboard';

describe('DeveloperDashboard', () => {
  let component: DeveloperDashboard;
  let fixture: ComponentFixture<DeveloperDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeveloperDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeveloperDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
