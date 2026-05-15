import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarUsuarioDialogComponent } from './editar-usuario-dialog.component';

describe('EditarUsuarioDialogComponent', () => {
  let component: EditarUsuarioDialogComponent;
  let fixture: ComponentFixture<EditarUsuarioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarUsuarioDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarUsuarioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
