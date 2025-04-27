import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearBolsilloDialogComponent } from './crear-bolsillo-dialog.component';

describe('CrearBolsilloDialogComponent', () => {
  let component: CrearBolsilloDialogComponent;
  let fixture: ComponentFixture<CrearBolsilloDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearBolsilloDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearBolsilloDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
