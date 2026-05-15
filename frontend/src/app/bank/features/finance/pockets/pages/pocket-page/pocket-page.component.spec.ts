import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PocketPageComponent } from './pocket-page.component';

describe('PocketPageComponent', () => {
  let component: PocketPageComponent;
  let fixture: ComponentFixture<PocketPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PocketPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PocketPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
