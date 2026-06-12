import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { CategoryService } from '../../../core/admin-side/category';
import Swal from 'sweetalert2';
import { CategoryService } from '../../../core/admin-side/Services/categoryService/category';

@Component({
  selector: 'app-add-category',
  standalone: true,
  // ReactiveFormsModule is required for [formGroup] to work
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category.html',
  styleUrls: ['./category.css']
})
export class Category implements OnInit {
  categoryForm!: FormGroup;

  // Mock data for the parent category dropdown
  parentCategories : any = []
  categories :any = [];
  allCategories: any[] = [];


  constructor(private fb: FormBuilder,
    private categoryService: CategoryService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Initialize the form with validation
    this.categoryForm = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      iconslug: ['', Validators.required],

      sortOrder: [0, Validators.min(0)],
      parentId: [''], 
      isActive: [true], 
      image: [null]
    });
    this.categoryService.getCategories().subscribe((data: any) => {
      this.categories = data 
      this.cd.detectChanges(); // Ensure the view updates with the new categories
      console.log(this.categories,'categories'); // Adjust based on actual API response structure
    });
    this.fetchParentCategories();
  }
  fetchParentCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: any) => {
        this.allCategories = data;
        this.parentCategories = this.allCategories.filter(
          cat => cat.parentId === null || cat.parentId === undefined
        );
        this.cd.detectChanges(); // Update the view with the new parent categories
        console.log('Parent Categories:', this.parentCategories);
      },
      error: err => {
        console.error('Error loading categories', err);
      }
    });
  }

  // Handle file selection for the image upload
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.categoryForm.patchValue({ image: file });
      // You can also add logic here to create a preview URL if needed
    }
  }

  onSubmit() {
    // 1. Check if the form is valid before doing anything
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return; 
    }

    const formValue = this.categoryForm.value;

    // 2. NEW: Check for duplicates in your existing categories array
    const isDuplicate = this.categories.some((cat: any) => {
      const existingNameEn = cat.nameEn ? cat.nameEn.toLowerCase().trim() : '';
      const existingNameAr = cat.nameAr ? cat.nameAr.toLowerCase().trim() : '';
      const newNameEn = formValue.nameEn.toLowerCase().trim();
      const newNameAr = formValue.nameAr.toLowerCase().trim();

      return existingNameEn === newNameEn || existingNameAr === newNameAr;
    });

    if (isDuplicate) {
      // 3. NEW: Show SweetAlert Warning for Duplicate
      Swal.fire({
        icon: 'warning',
        title: 'Duplicate Category',
        text: 'A category with this English or Arabic name already exists!',
        confirmButtonColor: '#3085d6'
      });
      return; // Stop the submission from happening
    }

    // 4. Create FormData (This is your original logic)
    const category = {
      nameEn: formValue.nameEn,
      nameAr: formValue.nameAr,
      iconSlug: formValue.iconslug,
      sortOrder: formValue.sortOrder,
      active: formValue.isActive,
      parentId: formValue.parentId ? Number(formValue.parentId) : null
    };

    const formData = new FormData();
    formData.append(
      'data',
      new Blob([JSON.stringify(category)], { type: 'application/json' })
    );

    if (formValue.image) {
      formData.append('file', formValue.image);
    }

    // 5. Submit to backend
    this.categoryService.addCategory(formData).subscribe({
      next: (response) => {
        // NEW: Success SweetAlert
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Category created successfully.',
          timer: 2000,
          showConfirmButton: false
        });

        // NEW: Add to local array so duplicate check keeps working without refreshing the page
        this.categories.push(category); 

        this.categoryForm.reset({
          sortOrder: 0,
          isActive: true,
          parentId: '',
          image: null
        });
      },
      error: (error) => {
        console.error('Error Creating Category', error.error.message);
        
        // NEW: Error SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'Something went wrong while creating the category. Please try again.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}
