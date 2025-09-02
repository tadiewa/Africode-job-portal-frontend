import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquireDevelopers } from './inquire-developers';

describe('InquireDevelopers', () => {
  let component: InquireDevelopers;
  let fixture: ComponentFixture<InquireDevelopers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquireDevelopers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InquireDevelopers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
