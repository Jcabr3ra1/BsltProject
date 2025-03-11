import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BolsillosComponent } from './bolsillos.component';

describe('BolsillosComponent', () => {
  let component: BolsillosComponent;
  let fixture: ComponentFixture<BolsillosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BolsillosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BolsillosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
