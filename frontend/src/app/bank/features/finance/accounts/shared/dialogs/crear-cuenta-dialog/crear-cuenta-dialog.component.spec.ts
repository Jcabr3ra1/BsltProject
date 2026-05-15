import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearCuentaDialogComponent } from './crear-cuenta-dialog.component';

describe('CrearCuentaDialogComponent', () => {
  let component: CrearCuentaDialogComponent;
  let fixture: ComponentFixture<CrearCuentaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearCuentaDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearCuentaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
