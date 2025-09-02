import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevelopersList } from './developers-list';

describe('DevelopersList', () => {
  let component: DevelopersList;
  let fixture: ComponentFixture<DevelopersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevelopersList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevelopersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
