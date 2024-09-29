import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaguesignupComponent } from './leaguesignup.component';

describe('LeaguesignupComponent', () => {
  let component: LeaguesignupComponent;
  let fixture: ComponentFixture<LeaguesignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaguesignupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaguesignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
