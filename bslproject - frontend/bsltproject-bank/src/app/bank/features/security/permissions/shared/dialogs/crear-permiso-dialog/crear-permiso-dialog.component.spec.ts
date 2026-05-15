import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPermisoDialogComponent } from './crear-permiso-dialog.component';

describe('CrearPermisoDialogComponent', () => {
  let component: CrearPermisoDialogComponent;
  let fixture: ComponentFixture<CrearPermisoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPermisoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPermisoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
