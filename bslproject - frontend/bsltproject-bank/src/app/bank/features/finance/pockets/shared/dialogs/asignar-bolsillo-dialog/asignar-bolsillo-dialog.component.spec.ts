import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarBolsilloDialogComponent } from './asignar-bolsillo-dialog.component';

describe('AsignarBolsilloDialogComponent', () => {
  let component: AsignarBolsilloDialogComponent;
  let fixture: ComponentFixture<AsignarBolsilloDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignarBolsilloDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignarBolsilloDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
