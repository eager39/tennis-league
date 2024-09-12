import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageleagueComponent } from './manageleague.component';

describe('ManageleagueComponent', () => {
  let component: ManageleagueComponent;
  let fixture: ComponentFixture<ManageleagueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageleagueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageleagueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
