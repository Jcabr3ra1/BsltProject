import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditCardPageComponent } from './credit-card-page.component';

describe('CreditCardPageComponent', () => {
  let component: CreditCardPageComponent;
  let fixture: ComponentFixture<CreditCardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditCardPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditCardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
