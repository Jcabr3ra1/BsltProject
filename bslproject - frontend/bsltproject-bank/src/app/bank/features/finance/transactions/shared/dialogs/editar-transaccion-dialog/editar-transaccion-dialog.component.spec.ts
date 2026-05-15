import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTransaccionDialogComponent } from './editar-transaccion-dialog.component';

describe('EditarTransaccionDialogComponent', () => {
  let component: EditarTransaccionDialogComponent;
  let fixture: ComponentFixture<EditarTransaccionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarTransaccionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarTransaccionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
