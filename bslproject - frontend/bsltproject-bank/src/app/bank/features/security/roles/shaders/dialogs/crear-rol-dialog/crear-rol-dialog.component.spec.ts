import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearRolDialogComponent } from './crear-rol-dialog.component';

describe('CrearRolDialogComponent', () => {
  let component: CrearRolDialogComponent;
  let fixture: ComponentFixture<CrearRolDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearRolDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearRolDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
