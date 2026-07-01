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
  previewUrl: string | null = null;
  path: string = environment.filePath;

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
    private productService: ProductService,
    private brandService: BrandService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
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
      unitSize: [null, [Validators.required, Validators.min(0.01)]],
      primaryImage: [null],
      details: this.fb.array([])
    });

    this.productForm.get('parentCategoryId')?.valueChanges.subscribe(parentId => {
      this.onParentCategoryChange(parentId);
    });

    this.fetchCategories();
    this.fetchFeatures();
    this.fetchBrands();

    this.route.paramMap.subscribe(params => {
      const id = params.get('productId');
      if (id) {
        this.productId = Number(id);
        this.loadProductData(this.productId);
      }
    });
  }

  loadProductData(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (product: any) => {
        if (product.images && product.images.length > 0) {
          this.previewUrl = this.path + product.images[0].imageUrl;
        }

        if (product.parentCategoryId) {
          this.onParentCategoryChange(product.parentCategoryId);
        }

        this.productForm.patchValue({
          parentCategoryId: product.parentCategoryId,
          categoryId: product.categoryId,
          nameEn: product.nameEn,
          nameAr: product.nameAr,
          brandId: product.brandId,
          descriptionEn: product.descriptionEn,
          descriptionAr: product.descriptionAr,
          unit: product.unit,
          unitSize: product.unitSize
        });

        this.details.clear();
        product.details?.forEach((detail: any) => {
          this.details.push(this.fb.group({
            attr_key_id: [detail.attr_key_id || detail.attributeKeyId, Validators.required],
            valueEn: [detail.valueEn || detail.attrValueEn, Validators.required],
            valueAr: [detail.valueAr || detail.attrValueAr, Validators.required]
          }));
        });
      },
      error: (err) => {
        console.error('Error loading product details', err);
        Swal.fire('Error', 'Failed to load product data', 'error');
      }
    });
  }

  fetchBrands(): void {
    this.brandService.getBrands().subscribe(data => {
      this.brands = data;
      this.cd.detectChanges();
    });
  }

  fetchCategories(): void {
    this.categoryService.getCategories().subscribe((data: any) => {
      this.allCategories = data;
      this.parentCategories = this.allCategories.filter(cat => !cat.parentId);
    });
  }

  onParentCategoryChange(parentId: any): void {
    const categoryIdControl = this.productForm.get('categoryId');
    if (this.productForm.value.parentCategoryId !== parentId) {
      categoryIdControl?.setValue(null);
    }
    this.childCategories = parentId ? this.allCategories.filter(cat => cat.parentId == parentId) : [];
    if (this.childCategories.length > 0) {
      categoryIdControl?.setValidators([Validators.required]);
    } else {
      categoryIdControl?.clearValidators();
    }
    categoryIdControl?.updateValueAndValidity();
  }

  fetchFeatures(): void {
    this.productService.getFeatures().subscribe((data: Feature[]) => {
      this.allFeatures = data;
    });
  }

  // --- Image Handling ---
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Update the form control with the new file
    this.productForm.patchValue({ primaryImage: file });

    // 2. Use FileReader to generate a data URL for immediate preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // This immediately replaces the old image URL in the UI
      this.previewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  clearImage(event: Event): void {
    event.preventDefault();
    this.previewUrl = null;
    this.productForm.patchValue({ primaryImage: null });
    this.fileInput.nativeElement.value = '';
  }

  // --- Details Array Handling ---
  get details(): FormArray {
    return this.productForm.get('details') as FormArray;
  }

  addDetail(): void {
    this.details.push(this.fb.group({
      attr_key_id: [null, Validators.required],
      valueEn: ['', Validators.required],
      valueAr: ['', Validators.required]
    }));
  }

  removeDetail(index: number): void {
    this.details.removeAt(index);
  }

  // --- Submission ---
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
    formData.append('data', new Blob([JSON.stringify(product)], { type: 'application/json' }));
    if (formValue.primaryImage) {
      formData.append('file', formValue.primaryImage);
    }

    this.productService.updateProduct(this.productId, formData).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Product updated successfully.', timer: 2000 });
      },
      error: (error) => {
        Swal.fire({ icon: 'error', title: 'Update Failed', text: error?.error?.message || 'Failed to update product.' });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin-side/product-list']);
  }
}