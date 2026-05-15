import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSectionComponent } from './app-section.component';

describe('AppSectionComponent', () => {
  let component: AppSectionComponent;
  let fixture: ComponentFixture<AppSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
