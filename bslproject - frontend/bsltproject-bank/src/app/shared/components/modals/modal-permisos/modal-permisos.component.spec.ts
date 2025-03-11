import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPermisosComponent } from './modal-permisos.component';

describe('ModalPermisosComponent', () => {
  let component: ModalPermisosComponent;
  let fixture: ComponentFixture<ModalPermisosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalPermisosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalPermisosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
