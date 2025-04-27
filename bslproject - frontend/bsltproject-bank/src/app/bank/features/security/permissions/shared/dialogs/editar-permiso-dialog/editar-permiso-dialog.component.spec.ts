import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPermisoDialogComponent } from './editar-permiso-dialog.component';

describe('EditarPermisoDialogComponent', () => {
  let component: EditarPermisoDialogComponent;
  let fixture: ComponentFixture<EditarPermisoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPermisoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPermisoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
