import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPermisosRolDialogComponent } from './ver-permisos-rol-dialog.component';

describe('VerPermisosRolDialogComponent', () => {
  let component: VerPermisosRolDialogComponent;
  let fixture: ComponentFixture<VerPermisosRolDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerPermisosRolDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerPermisosRolDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
