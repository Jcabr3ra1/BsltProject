import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarPermisoRolDialogComponent } from './asignar-permiso-rol-dialog.component';

describe('AsignarPermisoRolDialogComponent', () => {
  let component: AsignarPermisoRolDialogComponent;
  let fixture: ComponentFixture<AsignarPermisoRolDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignarPermisoRolDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignarPermisoRolDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
