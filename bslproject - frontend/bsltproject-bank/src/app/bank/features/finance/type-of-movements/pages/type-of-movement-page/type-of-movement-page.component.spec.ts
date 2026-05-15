import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeOfMovementPageComponent } from './type-of-movement-page.component';

describe('TypeOfMovementPageComponent', () => {
  let component: TypeOfMovementPageComponent;
  let fixture: ComponentFixture<TypeOfMovementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeOfMovementPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeOfMovementPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
