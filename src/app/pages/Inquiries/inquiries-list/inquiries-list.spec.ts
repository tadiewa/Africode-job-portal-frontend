import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquiriesList } from './inquiries-list';

describe('InquiriesList', () => {
  let component: InquiriesList;
  let fixture: ComponentFixture<InquiriesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiriesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InquiriesList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
