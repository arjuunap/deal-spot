import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { CategoryService } from '../../../core/admin-side/Services/categoryService/category';
import { BrandService } from '../../../core/admin-side/Services/brand/brand';
import { environment } from '../../../../environment/environment';

@Component({
  selector: 'app-edit-brand',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-brand.html',
  styleUrls: ['./edit-brand.css']
})
export class EditBrand implements OnInit {

  brandForm!: FormGroup;
  isSubmitting = false;

  statusMessage = '';
  statusType: 'success' | 'error' | '' = '';

  isCategoryDropdownOpen = false;

  categories: any[] = [];
  brandId!: number;

  logoPreviewUrl: string | null = null;
  bannerPreviewUrl: string | null = null;
  selectedLogoFileName: string | null = null;
  selectedBannerFileName: string | null = null;
  path: string = environment.filePath;

  @ViewChild('logoInput') logoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('bannerInput') bannerInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.brandId = Number(this.route.snapshot.paramMap.get('brandId'));
    console.log("brandId", this.brandId);
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
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });


    console.log(this.brandId);
    this.loadBrand();
  }

  loadBrand(): void {
    this.brandService.getBrandById(this.brandId).subscribe({
      next: (brand: any) => {
        console.log("brand details", brand)

        const categoryIds = (brand.categories ?? []).map((c: any) => c.id);

        this.brandForm.patchValue({
          nameEn: brand.nameEn ?? '',
          nameAr: brand.nameAr ?? '',
          descriptionEn: brand.descriptionEn ?? '',
          descriptionAr: brand.descriptionAr ?? '',
          websiteUrl: brand.websiteUrl ?? '',
          categoryIds: categoryIds
        });

        this.logoPreviewUrl = brand.logoUrl ?? null;
        this.bannerPreviewUrl = brand.bannerUrl ?? null;
      },
      error: (err) => {
        console.error('Error loading brand:', err);
        Swal.fire({
          icon: 'error',
          title: 'Failed to Load',
          text: 'Could not load brand details. Please try again.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  onLogoSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.brandForm.patchValue({ logoFile: file });
      this.selectedLogoFileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onBannerSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.brandForm.patchValue({ bannerFile: file });
      this.selectedBannerFileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.bannerPreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.logoPreviewUrl = null;
    this.selectedLogoFileName = null;
    this.brandForm.patchValue({ logoFile: null });
    if (this.logoInput) {
      this.logoInput.nativeElement.value = '';
    }
  }

  removeBanner(): void {
    this.bannerPreviewUrl = null;
    this.selectedBannerFileName = null;
    this.brandForm.patchValue({ bannerFile: null });
    if (this.bannerInput) {
      this.bannerInput.nativeElement.value = '';
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
      categoryControl?.setValue([...currentValues, categoryId]);
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/brands']);
  }

  onSubmit(): void {
    if (this.brandForm.invalid) {
      this.brandForm.markAllAsTouched();
      this.showMessage('Please fill all required fields correctly.', 'error');
      return;
    }

    this.isSubmitting = true;

    const formValue = this.brandForm.value;

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
      new Blob([JSON.stringify(brandDto)], { type: 'application/json' })
    );

    if (formValue.logoFile) {
      formData.append('logoFile', formValue.logoFile);
    }

    if (formValue.bannerFile) {
      formData.append('bannerFile', formValue.bannerFile);
    }

    this.brandService.updateBrand(this.brandId, formData).subscribe({
      next: (res) => {
        console.log('Brand updated successfully!', res);

        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Brand updated successfully.',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/admin/brands']);
        });

        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error updating brand:', err);

        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'Something went wrong while updating the brand. Please try again.',
          confirmButtonColor: '#d33'
        });

        this.isSubmitting = false;
      }
    });
  }

  private showMessage(msg: string, type: 'success' | 'error'): void {
    this.statusMessage = msg;
    this.statusType = type;
    setTimeout(() => {
      this.statusMessage = '';
      this.statusType = '';
    }, 3000);
  }
}