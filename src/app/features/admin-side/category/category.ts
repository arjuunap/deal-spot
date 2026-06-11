import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/admin-side/category';

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
  parentCategories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Fashion' },
    { id: 3, name: 'Home & Living' }
  ];
  categories :any = [];

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
      parentId: [''], // Empty string means no parent (Root Category)
      isActive: [true], // Default to active
      image: [null]
    });
    this.categoryService.getCategories().subscribe((data: any) => {
      this.categories = data 
      this.cd.detectChanges(); // Ensure the view updates with the new categories
      console.log(this.categories,'categories'); // Adjust based on actual API response structure
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
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;

      const category = {
        nameEn: formValue.nameEn,
        nameAr: formValue.nameAr,
        iconSlug: formValue.iconslug,
        sortOrder: formValue.sortOrder,
        active: formValue.isActive,
        parentId: formValue.parentId
          ? Number(formValue.parentId)
          : null
      };

      const formData = new FormData();

      formData.append(
        'data',
        new Blob(
          [JSON.stringify(category)],
          { type: 'application/json' }
        )
      );

      if (formValue.image) {
        formData.append('file', formValue.image);
      }

      this.categoryService.addCategory(formData).subscribe({
        next: (response) => {
          console.log('Category Created Successfully', response);

          alert('Category Created Successfully');

          this.categoryForm.reset({
            sortOrder: 0,
            isActive: true,
            parentId: '',
            image: null
          });
        },

        error: (error) => {
          console.error('Error Creating Category', error);

          alert('Failed to create category');
        }
      });

    }

    // Highlight errors if user tries to submit an invalid form
    this.categoryForm.markAllAsTouched();
  }
}
