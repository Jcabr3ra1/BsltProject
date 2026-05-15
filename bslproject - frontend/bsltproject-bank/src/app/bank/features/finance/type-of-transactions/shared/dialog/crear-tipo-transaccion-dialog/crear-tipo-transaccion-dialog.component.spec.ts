import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTipoTransaccionDialogComponent } from './crear-tipo-transaccion-dialog.component';

describe('CrearTipoTransaccionDialogComponent', () => {
  let component: CrearTipoTransaccionDialogComponent;
  let fixture: ComponentFixture<CrearTipoTransaccionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearTipoTransaccionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearTipoTransaccionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
