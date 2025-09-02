import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreDevelopers } from './explore-developers';

describe('ExploreDevelopers', () => {
  let component: ExploreDevelopers;
  let fixture: ComponentFixture<ExploreDevelopers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreDevelopers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreDevelopers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
