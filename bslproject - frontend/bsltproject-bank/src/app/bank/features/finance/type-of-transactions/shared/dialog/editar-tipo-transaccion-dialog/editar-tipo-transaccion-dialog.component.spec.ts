import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTipoTransaccionDialogComponent } from './editar-tipo-transaccion-dialog.component';

describe('EditarTipoTransaccionDialogComponent', () => {
  let component: EditarTipoTransaccionDialogComponent;
  let fixture: ComponentFixture<EditarTipoTransaccionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarTipoTransaccionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarTipoTransaccionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
