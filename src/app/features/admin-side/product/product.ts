import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CategoryService } from '../../../core/admin-side/category';
import { Product } from '../../../core/admin-side/product/product';
import { FeatureService } from '../../../core/admin-side/features/features';
import { BrandService } from '../../../core/admin-side/brand/brand';

interface Feature {
  id: number;
  attrKeyEn: string;
  attrKeyAr: string;
}

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product.html',
  styleUrls: ['./product.css']
})
export class AddProduct implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  productForm!: FormGroup;

  productUnits = [
    'EACH', 'KG', 'GRAM', 'LITRE', 'ML', 'PACK', 'BOX', 'PAIR', 'SET'
  ];

  allCategories: any[] = [];
  parentCategories: any[] = [];
  childCategories: any[] = [];

  allFeatures: Feature[] = [];
  brands: any = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private productService: Product,
    private featureService: FeatureService,
    private brandService: BrandService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      parentCategoryId: [null, Validators.required],
      categoryId: [null, Validators.required],
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],

      brandId: [null],

      descriptionEn: [''],
      descriptionAr: [''],

      unit: ['EACH', Validators.required],
      unitSize: [
        null,
        [Validators.required, Validators.min(0.01)]
      ],

      primaryImage: [null],

      details: this.fb.array([])
    });

    this.productForm
      .get('parentCategoryId')
      ?.valueChanges.subscribe(parentId => {
        this.onParentCategoryChange(parentId);
      });

    this.fetchCategories();
    this.fetchFeatures();
    this.fetchBrands();
    this.productService.getProducts().subscribe({
      next: (data) => {
        console.log('Fetched products:', data);
      }});
  }

  fetchBrands(): void {
    this.brandService.getBrands().subscribe({
      next: (data) => {
        this.brands = data;
        this.cd.detectChanges();
      }
    });
  }

  // =========================
  // DETAILS FORM ARRAY
  // =========================

  get details(): FormArray {
    return this.productForm.get('details') as FormArray;
  }

  createDetailGroup(): FormGroup {
    return this.fb.group({
      // These are the names of your form controls
      attr_key_id: [null, Validators.required],
      valueEn: ['', Validators.required],
      valueAr: ['', Validators.required]
    });
  }

  addDetail(): void {
    this.details.push(this.createDetailGroup());
  }

  removeDetail(index: number): void {
    this.details.removeAt(index);
  }

  // =========================
  // CATEGORY METHODS
  // =========================

  fetchCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: any) => {
        this.allCategories = data;
        this.parentCategories = this.allCategories.filter(
          cat => cat.parentId === null || cat.parentId === undefined
        );
      },
      error: err => {
        console.error('Error loading categories', err);
      }
    });
  }

  onParentCategoryChange(parentId: any): void {
    const categoryIdControl = this.productForm.get('categoryId');
    categoryIdControl?.setValue(null);

    if (parentId) {
      this.childCategories = this.allCategories.filter(
        cat => cat.parentId == parentId
      );
      if (this.childCategories.length > 0) {
        categoryIdControl?.setValidators([Validators.required]);
      } else {
        categoryIdControl?.clearValidators();
      }
    } else {
      this.childCategories = [];
      categoryIdControl?.clearValidators();
    }
    categoryIdControl?.updateValueAndValidity();
  }

  // =========================
  // FEATURES / ATTRIBUTES
  // =========================

  fetchFeatures(): void {
    this.featureService.getFeatures().subscribe({
      next: (data: Feature[]) => {
        this.allFeatures = data;
      },
      error: err => {
        console.error('Error fetching features:', err);
      }
    });
  }

  // =========================
  // FILE UPLOAD
  // =========================

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5 MB');
      return;
    }

    this.productForm.patchValue({
      primaryImage: file
    });
  }

  // =========================
  // SUBMIT
  // =========================

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.value;

    const product = {
      parentCategoryId: Number(formValue.parentCategoryId),
      categoryId: formValue.categoryId ? Number(formValue.categoryId) : null,

      nameEn: formValue.nameEn,
      nameAr: formValue.nameAr,

      brandId: formValue.brandId ? Number(formValue.brandId) : null,

      descriptionEn: formValue.descriptionEn,
      descriptionAr: formValue.descriptionAr,

      unit: formValue.unit,
      unitSize: Number(formValue.unitSize),

      // FIX: Map correctly from the form control names to the DTO names
      details: formValue.details.map((detail: any) => ({
        attributeKeyId: Number(detail.attr_key_id),
        attrValueEn: detail.valueEn,
        attrValueAr: detail.valueAr
      }))
    };

    const formData = new FormData();

    formData.append(
      'data',
      new Blob([JSON.stringify(product)], {
        type: 'application/json'
      })
    );

    if (formValue.primaryImage) {
      formData.append(
        'file',
        formValue.primaryImage
      );
    }

    console.log('Submitting product:', product);

    this.productService.addProduct(formData).subscribe({
      next: () => {
        alert('Product added successfully');

        this.productForm.reset({
          unit: 'EACH'
        });

        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }

        this.details.clear();
        this.childCategories = [];
      },
      error: error => {
        console.error('Error adding product:', error);
        alert('Failed to add product');
      }
    });
  }

  onCancel(): void {
    this.productForm.reset({
      unit: 'EACH'
    });
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.details.clear();
    this.childCategories = [];
  }
}