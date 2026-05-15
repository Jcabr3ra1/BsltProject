import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeOfTransactionPageComponent } from './type-of-transaction-page.component';

describe('TypeOfTransactionPageComponent', () => {
  let component: TypeOfTransactionPageComponent;
  let fixture: ComponentFixture<TypeOfTransactionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeOfTransactionPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeOfTransactionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
