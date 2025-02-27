import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaguedrawComponent } from './leaguedraw.component';

describe('LeaguedrawComponent', () => {
  let component: LeaguedrawComponent;
  let fixture: ComponentFixture<LeaguedrawComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaguedrawComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaguedrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
