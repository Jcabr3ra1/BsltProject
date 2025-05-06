import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCuentaDialogComponent } from './editar-cuenta-dialog.component';

describe('EditarCuentaDialogComponent', () => {
  let component: EditarCuentaDialogComponent;
  let fixture: ComponentFixture<EditarCuentaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarCuentaDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarCuentaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
