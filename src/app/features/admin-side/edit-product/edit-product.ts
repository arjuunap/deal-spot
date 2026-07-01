import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import Swal from 'sweetalert2';
import { CategoryService } from '../../../core/admin-side/Services/categoryService/category';
import { ProductService } from '../../../core/admin-side/Services/product/product';
import { BrandService } from '../../../core/admin-side/Services/brand/brand';
import { environment } from '../../../../environment/environment';

interface Feature {
  id: number;
  attrKeyEn: string;
  attrKeyAr: string;
}

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-product.html',
  styleUrls: ['./edit-product.css']
})
export class EditProduct implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  productForm!: FormGroup;
  productId!: number;

  productUnits = [
    'EACH', 'KG', 'GRAM', 'LITRE', 'ML', 'PACK', 'BOX', 'PAIR', 'SET'
  ];

  allCategories: any[] = [];
  parentCategories: any[] = [];
  childCategories: any[] = [];

  allFeatures: Feature[] = [];
  brands: any = [];
  id: string = ''
  imagePreview: any;
    path: string =  environment.filePath; ;


  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private productService: ProductService,
    private brandService: BrandService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute // Added ActivatedRoute to get the product ID

  ) { }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('productId');

    console.log(productId);
    this.productForm = this.fb.group({
      parentCategoryId: [null, Validators.required],
      categoryId: [null, Validators.required],
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      brandId: [null],
      descriptionEn: [''],
      descriptionAr: [''],
      unit: ['EACH', Validators.required],
      unitSize: [null, [Validators.required, Validators.min(0.01)]],
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

    // Fetch the product ID from the route and load existing data
    this.route.paramMap.subscribe(params => {
      const id = params.get('productId');
      if (id) {
        this.productId = Number(id);
        this.loadProductData(this.productId);
      }
    });
  }

  loadProductData(id: number): void {
    // Note: Ensure getProductById exists in your ProductService
    this.productService.getProductById(id).subscribe({
      next: (product: any) => {
        console.log('Fetched product:', product);
        this.imagePreview = product.images[0].imageUrl
        console.log(this.imagePreview)


        // Populate child categories if parent category exists
        if (product.parentCategoryId) {
          this.onParentCategoryChange(product.parentCategoryId);
        }

        // Patch the standard form controls
        this.productForm.patchValue({  
          parentCategoryId: product.parentCategoryId,
          categoryId: product.categoryId,
          nameEn: product.nameEn,
          nameAr: product.nameAr,
          brandId: product.brandId,
          descriptionEn: product.descriptionEn,
          descriptionAr: product.descriptionAr,
          unit: product.unit,
          unitSize: product.unitSize,



        });

        // Clear existing empty details and populate with fetched details
        this.details.clear();
        if (product.details && product.details.length > 0) {
          product.details.forEach((detail: any) => {
            this.details.push(this.fb.group({
              // Fallbacks used depending on your backend GET response property names
              attr_key_id: [detail.attributeKeyId || detail.attr_key_id, Validators.required],
              valueEn: [detail.attrValueEn || detail.valueEn, Validators.required],
              valueAr: [detail.attrValueAr || detail.valueAr, Validators.required]
            }));
          });
        }
      },
      error: (err) => {
        console.error('Error loading product details', err);
        Swal.fire('Error', 'Failed to load product data', 'error');
      }
    });
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

    // Only clear if the parentId actually changes to a different value to avoid wiping data during initialization patch
    if (this.productForm.value.parentCategoryId !== parentId) {
      categoryIdControl?.setValue(null);
    }

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
    this.productService.getFeatures().subscribe({
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
      details: formValue.details.map((detail: any) => ({
        attributeKeyId: Number(detail.attr_key_id),
        attrValueEn: detail.valueEn,
        attrValueAr: detail.valueAr
      }))
    };

    const formData = new FormData();

    formData.append(
      'data',
      new Blob([JSON.stringify(product)], { type: 'application/json' })
    );

    if (formValue.primaryImage) {
      formData.append('file', formValue.primaryImage);
    }

    // Note: Ensure updateProduct exists in your ProductService
    this.productService.updateProduct(this.productId, formData).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Product updated successfully.',
          timer: 2000,
          showConfirmButton: false
        });
        console.log('res', res)


      },
      error: (error) => {
        console.error('Error updating product:', error);
        const backendErrorMessage = error?.error?.message || error?.message || 'Failed to update product.';

        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: backendErrorMessage,
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  onCancel(): void {
    // Navigate back to the product list or previous page
    this.router.navigate(['/admin-side/product-list']);
  }
}