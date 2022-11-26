import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProverClientMainComponent } from './prover-client-main.component';

describe('ProverClientMainComponent', () => {
  let component: ProverClientMainComponent;
  let fixture: ComponentFixture<ProverClientMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProverClientMainComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProverClientMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
