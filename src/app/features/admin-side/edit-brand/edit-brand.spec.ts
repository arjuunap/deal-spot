import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBrand } from './edit-brand';

describe('EditBrand', () => {
  let component: EditBrand;
  let fixture: ComponentFixture<EditBrand>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBrand],
    }).compileComponents();

    fixture = TestBed.createComponent(EditBrand);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
