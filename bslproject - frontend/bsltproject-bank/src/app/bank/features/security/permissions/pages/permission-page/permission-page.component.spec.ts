import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionPageComponent } from './permission-page.component';

describe('PermissionPageComponent', () => {
  let component: PermissionPageComponent;
  let fixture: ComponentFixture<PermissionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
