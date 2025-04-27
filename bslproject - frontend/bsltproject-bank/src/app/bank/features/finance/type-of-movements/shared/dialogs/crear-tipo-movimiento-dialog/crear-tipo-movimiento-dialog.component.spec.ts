import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTipoMovimientoDialogComponent } from './crear-tipo-movimiento-dialog.component';

describe('CrearTipoMovimientoDialogComponent', () => {
  let component: CrearTipoMovimientoDialogComponent;
  let fixture: ComponentFixture<CrearTipoMovimientoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearTipoMovimientoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearTipoMovimientoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
