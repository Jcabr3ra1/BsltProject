import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTipoMovimientoDialogComponent } from './editar-tipo-movimiento-dialog.component';

describe('EditarTipoMovimientoDialogComponent', () => {
  let component: EditarTipoMovimientoDialogComponent;
  let fixture: ComponentFixture<EditarTipoMovimientoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarTipoMovimientoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarTipoMovimientoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
