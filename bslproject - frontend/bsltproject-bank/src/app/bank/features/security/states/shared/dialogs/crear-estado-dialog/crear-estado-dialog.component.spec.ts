import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearEstadoDialogComponent } from './crear-estado-dialog.component';

describe('CrearEstadoDialogComponent', () => {
  let component: CrearEstadoDialogComponent;
  let fixture: ComponentFixture<CrearEstadoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearEstadoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearEstadoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
