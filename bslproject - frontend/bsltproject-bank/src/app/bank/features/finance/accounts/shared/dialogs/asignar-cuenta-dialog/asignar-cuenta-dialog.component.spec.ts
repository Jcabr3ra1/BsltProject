import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarCuentaDialogComponent } from './asignar-cuenta-dialog.component';

describe('AsignarCuentaDialogComponent', () => {
  let component: AsignarCuentaDialogComponent;
  let fixture: ComponentFixture<AsignarCuentaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignarCuentaDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignarCuentaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
