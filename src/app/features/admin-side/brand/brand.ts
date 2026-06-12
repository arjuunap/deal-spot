import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../core/admin-side/category';
import { BrandService } from '../../../core/admin-side/brand/brand';
import Swal from 'sweetalert2';

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
  brands: any = [];

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
      // You can keep your existing message or use Swal here too
      this.showMessage('Please fill all required fields correctly.', 'error');
      this.brandForm.markAllAsTouched();
      return;
    }

    const formValue = this.brandForm.value;

    // 1. Check for duplicates in the existing brands array
    const isDuplicate = this.brands.some((brand: any) => {
      const existingNameEn = brand.nameEn ? brand.nameEn.toLowerCase().trim() : '';
      const existingNameAr = brand.nameAr ? brand.nameAr.toLowerCase().trim() : '';
      const newNameEn = formValue.nameEn.toLowerCase().trim();
      const newNameAr = formValue.nameAr.toLowerCase().trim();

      return existingNameEn === newNameEn || existingNameAr === newNameAr;
    });

    if (isDuplicate) {
      // 2. Show SweetAlert Warning for Duplicate
      Swal.fire({
        icon: 'warning',
        title: 'Duplicate Brand',
        text: 'A brand with this English or Arabic name already exists!',
        confirmButtonColor: '#3085d6'
      });
      return; // Stop the submission
    }

    this.isSubmitting = true;

    // 3. Create the DTO matching your backend expectation
    const brandDto = {
      nameEn: formValue.nameEn,
      nameAr: formValue.nameAr,
      descriptionEn: formValue.descriptionEn,
      descriptionAr: formValue.descriptionAr,
      websiteUrl: formValue.websiteUrl,
      categoryIds: formValue.categoryIds
    };

    // 4. Initialize FormData
    const formData = new FormData();

    // 5. Append the DTO as a JSON Blob to the 'data' part
    formData.append(
      'data',
      new Blob([JSON.stringify(brandDto)], { type: 'application/json' })
    );

    // 6. Append files to their respective parts if they exist
    if (formValue.logoFile) {
      formData.append('logoFile', formValue.logoFile);
    }
    
    if (formValue.bannerFile) {
      formData.append('bannerFile', formValue.bannerFile);
    }

    // 7. Send the FormData payload via your service
    this.brandService.addBrand(formData).subscribe({
      next: (res) => {
        console.log('Brand added successfully!', res);
        
        // Success SweetAlert
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Brand added successfully.',
          timer: 2000,
          showConfirmButton: false
        });

        // Add the new brand to our local array so the duplicate check works immediately
        this.brands.push(brandDto);
        
        // Reset the form
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
        
        // Error SweetAlert
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

  private showMessage(msg: string, type: 'success' | 'error'): void {
    this.statusMessage = msg;
    this.statusType = type;
    setTimeout(() => {
      this.statusMessage = '';
      this.statusType = '';
    }, 3000);
  }
}