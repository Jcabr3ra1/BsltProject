import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEstadoDialogComponent } from './editar-estado-dialog.component';

describe('EditarEstadoDialogComponent', () => {
  let component: EditarEstadoDialogComponent;
  let fixture: ComponentFixture<EditarEstadoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarEstadoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarEstadoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
