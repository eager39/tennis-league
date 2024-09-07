import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonselectorComponent } from './seasonselector.component';

describe('SeasonselectorComponent', () => {
  let component: SeasonselectorComponent;
  let fixture: ComponentFixture<SeasonselectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonselectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeasonselectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
