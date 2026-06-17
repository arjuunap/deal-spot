import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { CategoryService } from '../../../core/admin-side/Services/categoryService/category';
import { BrandService } from '../../../core/admin-side/Services/brand/brand';

@Component({
  selector: 'app-add-brand',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './brand.html',
  styleUrls: ['./brand.css']
})
export class Brand implements OnInit {

  brandForm!: FormGroup;
  isSubmitting = false;

  statusMessage = '';
  statusType: 'success' | 'error' | '' = '';

  isCategoryDropdownOpen = false;

  categories: any[] = [];
  brands: any[] = [];

  @ViewChild('logoInput') logoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('bannerInput') bannerInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private brandService: BrandService
  ) {}

  ngOnInit(): void {
    this.brandForm = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      descriptionEn: [''],
      descriptionAr: [''],
      websiteUrl: ['', [Validators.pattern('https?://.+')]],
      categoryIds: [[], Validators.required],
      logoFile: [null],
      bannerFile: [null]
    });

    this.categoryService.getCategories().subscribe({
      next: (data: any) => {
        this.categories = data.filter(
          (category: any) => category.parentId === null
        );

        console.log('Filtered parent categories:', this.categories);
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });

    this.fetchBrands();
  }

  fetchBrands(): void {
    this.brandService.getBrands().subscribe({
      next: (data: any) => {
        console.log('Fetched brands:', data);
        this.brands = data;
      },
      error: (err) => {
        console.error('Error fetching brands:', err);
      }
    });
  }

  onLogoSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      this.brandForm.patchValue({
        logoFile: file
      });
    }
  }

  onBannerSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      this.brandForm.patchValue({
        bannerFile: file
      });
    }
  }

  toggleDropdown(): void {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  toggleCategory(categoryId: number): void {
    const categoryControl = this.brandForm.get('categoryIds');
    const currentValues = categoryControl?.value as number[];

    if (currentValues.includes(categoryId)) {
      categoryControl?.setValue(
        currentValues.filter(id => id !== categoryId)
      );
    } else {
      categoryControl?.setValue([
        ...currentValues,
        categoryId
      ]);
    }
  }

  onSubmit(): void {

    if (this.brandForm.invalid) {
      this.showMessage(
        'Please fill all required fields correctly.',
        'error'
      );

      this.brandForm.markAllAsTouched();
      return;
    }

    const formValue = this.brandForm.value;

    const isDuplicate = this.brands.some((brand: any) => {

      const existingNameEn = brand.nameEn
        ? brand.nameEn.toLowerCase().trim()
        : '';

      const existingNameAr = brand.nameAr
        ? brand.nameAr.toLowerCase().trim()
        : '';

      const newNameEn = formValue.nameEn
        .toLowerCase()
        .trim();

      const newNameAr = formValue.nameAr
        .toLowerCase()
        .trim();

      return (
        existingNameEn === newNameEn ||
        existingNameAr === newNameAr
      );
    });

    if (isDuplicate) {
      Swal.fire({
        icon: 'warning',
        title: 'Duplicate Brand',
        text: 'A brand with this English or Arabic name already exists!',
        confirmButtonColor: '#3085d6'
      });

      return;
    }

    this.isSubmitting = true;

    const brandDto = {
      nameEn: formValue.nameEn,
      nameAr: formValue.nameAr,
      descriptionEn: formValue.descriptionEn,
      descriptionAr: formValue.descriptionAr,
      websiteUrl: formValue.websiteUrl,
      categoryIds: formValue.categoryIds
    };

    const formData = new FormData();

    formData.append(
      'data',
      new Blob(
        [JSON.stringify(brandDto)],
        { type: 'application/json' }
      )
    );

    if (formValue.logoFile) {
      formData.append(
        'logoFile',
        formValue.logoFile
      );
    }

    if (formValue.bannerFile) {
      formData.append(
        'bannerFile',
        formValue.bannerFile
      );
    }

    this.brandService.addBrand(formData).subscribe({
      next: (res) => {

        console.log('Brand added successfully!', res);

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Brand added successfully.',
          timer: 2000,
          showConfirmButton: false
        });

        this.brands.push(brandDto);

        this.brandForm.reset({
          nameEn: '',
          nameAr: '',
          descriptionEn: '',
          descriptionAr: '',
          websiteUrl: '',
          categoryIds: [],
          logoFile: null,
          bannerFile: null
        });

        if (this.logoInput) {
          this.logoInput.nativeElement.value = '';
        }

        if (this.bannerInput) {
          this.bannerInput.nativeElement.value = '';
        }

        this.isCategoryDropdownOpen = false;
        this.isSubmitting = false;
      },

      error: (err) => {

        console.error('Error adding brand:', err);

        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'Something went wrong while adding the brand. Please try again.',
          confirmButtonColor: '#d33'
        });

        this.isSubmitting = false;
      }
    });
  }

  private showMessage(
    msg: string,
    type: 'success' | 'error'
  ): void {

    this.statusMessage = msg;
    this.statusType = type;

    setTimeout(() => {
      this.statusMessage = '';
      this.statusType = '';
    }, 3000);
  }
}