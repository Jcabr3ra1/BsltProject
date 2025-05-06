import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarBolsilloDialogComponent } from './editar-bolsillo-dialog.component';

describe('EditarBolsilloDialogComponent', () => {
  let component: EditarBolsilloDialogComponent;
  let fixture: ComponentFixture<EditarBolsilloDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarBolsilloDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarBolsilloDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
