import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/admin-side/category';
import { Product } from '../../../core/admin-side/product/product';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product.html',
  styleUrls: ['./product.css']
})
export class AddProduct implements OnInit {
  productForm!: FormGroup;

  // Derived exactly from your Java ProductUnit Enum
  productUnits = [
    'EACH', 'KG', 'GRAM', 'LITRE', 'ML', 'PACK', 'BOX', 'PAIR', 'SET'
  ];

  allCategories: any[] = [];
  parentCategories: any[] = [];
  childCategories: any[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private cd: ChangeDetectorRef,
    private productService: Product
  ) { }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      parentCategoryId: ['', Validators.required], // Tracks the Main Category dropdown
      categoryId: ['', Validators.required],       // Tracks the Sub Category dropdown
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      brand: [''],
      brandAr: [''],
      descriptionEn: [''],
      descriptionAr: [''],
      unit: ['EACH', Validators.required], // Default to EACH
      unitSize: [null, [Validators.required, Validators.min(0.01)]],
      primaryImage: [null]
    });

    // Listen for changes on the Main Category dropdown
    this.productForm.get('parentCategoryId')?.valueChanges.subscribe(selectedParentId => {
      this.onParentCategoryChange(selectedParentId);
    });

    this.fetchCategories();
  }

  fetchCategories() {
    this.categoryService.getCategories().subscribe((data: any) => {
      this.allCategories = data;

      // Filter out only the Main Categories (where parentId is null or undefined)
      this.parentCategories = this.allCategories.filter(cat => cat.parentId === null || cat.parentId === undefined);

      this.cd.detectChanges(); // Ensure the view updates with the new categories
      console.log('Categories Loaded:', this.parentCategories);
    });
  }

  onParentCategoryChange(parentId: any) {
    // Reset the sub-category selection when the main category changes
    this.productForm.get('categoryId')?.setValue('');

    if (parentId) {
      // Filter the complete list to find children of the selected parent
      this.childCategories = this.allCategories.filter(cat => cat.parentId == parentId);
    } else {
      this.childCategories = [];
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.productForm.patchValue({ primaryImage: file });
    }
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      const product = {
        parentCategoryId: formValue.parentCategoryId,
        categoryId: formValue.categoryId,
        nameEn: formValue.nameEn,
        nameAr: formValue.nameAr,
        brand: formValue.brand,
        brandAr: formValue.brandAr,
        descriptionEn: formValue.descriptionEn,
        descriptionAr: formValue.descriptionAr,
        unit: formValue.unit,
        unitSize: formValue.unitSize,
        primaryImage: formValue.primaryImage
      };

      const formData = new FormData();
      formData.append(
        'data',
        new Blob(
          [JSON.stringify(product)],
          { type: 'application/json' }
        )
      );
      
      if (formValue.primaryImage) {
        formData.append('file', formValue.primaryImage);
      }
      console.log('Product Data Submitted:', this.productForm.value);
      this.productService.addProduct(formData).subscribe({
        next: (response) => {
          console.log('Product added successfully:', response);
          // Optionally reset the form or navigate away
        },
        error: (error) => {
          console.error('Error adding product:', error);
        }
      });
    } else {
      this.productForm.markAllAsTouched();
    }
  }
}

