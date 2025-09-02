import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinNetwork } from './join-network';

describe('JoinNetwork', () => {
  let component: JoinNetwork;
  let fixture: ComponentFixture<JoinNetwork>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinNetwork]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinNetwork);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
