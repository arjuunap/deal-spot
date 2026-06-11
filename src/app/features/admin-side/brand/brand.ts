import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../core/admin-side/category';
import { BrandService } from '../../../core/admin-side/brand/brand';

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

  // Custom dropdown state
  isCategoryDropdownOpen = false;

  categories: any = [];

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private categoryService: CategoryService,
    private brandService: BrandService
  ) { }

  ngOnInit(): void {
    this.brandForm = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      descriptionEn: ['', Validators.required],
      descriptionAr: ['', Validators.required],
      websiteUrl: ['', [Validators.pattern('https?://.+')]],
      categoryIds: [[], Validators.required],
      // Add form controls for the files
      logoFile: [null],
      bannerFile: [null]
    });

    this.categoryService.getCategories().subscribe({
      next: (data: any) => {
        // .filter() loops through the array and keeps only items where parentId is null
        this.categories = data.filter((category: any) => category.parentId === null);
        console.log('Filtered parent categories:', this.categories);
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });
  }

  // --- File Selection Handlers ---
  onLogoSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.brandForm.patchValue({ logoFile: file });
    }
  }

  onBannerSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.brandForm.patchValue({ bannerFile: file });
    }
  }
  // -------------------------------

  toggleDropdown(): void {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  toggleCategory(categoryId: number): void {
    const categoryControl = this.brandForm.get('categoryIds');
    const currentValues = categoryControl?.value as number[];

    if (currentValues.includes(categoryId)) {
      // Remove it if it's already selected
      categoryControl?.setValue(currentValues.filter(id => id !== categoryId));
    } else {
      // Add it if it's not selected
      categoryControl?.setValue([...currentValues, categoryId]);
    }
  }

  onSubmit(): void {
    if (this.brandForm.invalid) {
      this.showMessage('Please fill all required fields correctly.', 'error');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.brandForm.value;

    // 1. Create the DTO matching your backend expectation
    const brandDto = {
      nameEn: formValue.nameEn,
      nameAr: formValue.nameAr,
      descriptionEn: formValue.descriptionEn,
      descriptionAr: formValue.descriptionAr,
      websiteUrl: formValue.websiteUrl,
      categoryIds: formValue.categoryIds
    };

    // 2. Initialize FormData
    const formData = new FormData();

    // 3. Append the DTO as a JSON Blob to the 'data' part
    formData.append(
      'data',
      new Blob([JSON.stringify(brandDto)], { type: 'application/json' })
    );

    // 4. Append files to their respective parts if they exist
    if (formValue.logoFile) {
      formData.append('logoFile', formValue.logoFile);
    }
    
    if (formValue.bannerFile) {
      formData.append('bannerFile', formValue.bannerFile);
    }

    // 5. Send the FormData payload via your service
    this.brandService.addBrand(formData).subscribe({
      next: (res) => {
        console.log('Brand added successfully!', res);
        this.showMessage('Brand added successfully!', 'success');
        
        // Reset the form, explicitly clearing the arrays and files
        this.brandForm.reset({ 
          categoryIds: [], 
          logoFile: null, 
          bannerFile: null 
        }); 
        
        this.isSubmitting = false;
        this.isCategoryDropdownOpen = false;
      },
      error: (err) => {
        console.error('Error adding brand:', err);
        this.showMessage('Failed to add brand. Check console.', 'error');
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