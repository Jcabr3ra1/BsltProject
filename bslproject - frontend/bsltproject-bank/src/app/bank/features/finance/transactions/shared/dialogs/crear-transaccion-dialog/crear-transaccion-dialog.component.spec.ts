import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTransaccionDialogComponent } from './crear-transaccion-dialog.component';

describe('CrearTransaccionDialogComponent', () => {
  let component: CrearTransaccionDialogComponent;
  let fixture: ComponentFixture<CrearTransaccionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearTransaccionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearTransaccionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
