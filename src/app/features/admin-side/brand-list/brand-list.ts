import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrandService } from '../../../core/admin-side/Services/brand/brand';
import { Router } from '@angular/router';
import { environment } from '../../../../environment/environment';

@Component({
  selector: 'app-brand-list',
  imports: [FormsModule],
  templateUrl: './brand-list.html',
  styleUrl: './brand-list.css',
})
export class BrandList {

  constructor(
    private brandService: BrandService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) { }

  brands: any = [];
  filteredBrands: any = [];
  searchTerm: string = '';
  path: string = environment.filePath;

  ngOnInit(): void {
    this.fetchBrands();
  }

  fetchBrands(): void {
    this.brandService.getBrands().subscribe({
      next: (data: any) => {
        this.brands = data;
        this.filteredBrands = data;
        this.cd.detectChanges();
        console.log('Fetched brands:', data);
      },
      error: (err) => {
        console.error('Error fetching brands:', err);
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredBrands = this.brands;
      return;
    }

    this.filteredBrands = this.brands.filter((brand: any) => {
      const nameEn = brand.nameEn?.toLowerCase() || '';
      const nameAr = brand.nameAr?.toLowerCase() || '';
      const descEn = brand.descriptionEn?.toLowerCase() || '';
      const descAr = brand.descriptionAr?.toLowerCase() || '';
      const categories = (brand.categories || [])
        .map((c: any) => c.nameEn?.toLowerCase() || '')
        .join(' ');

      return (
        nameEn.includes(term) ||
        nameAr.includes(term) ||
        descEn.includes(term) ||
        descAr.includes(term) ||
        categories.includes(term)
      );
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredBrands = this.brands;
  }

  addBrand() {
    this.router.navigate(['/admin-side/brand']);
  }

  deleteBrand(brandId: number): void {
    this.brandService.deleteBrand(brandId).subscribe({
      next: () => {
        console.log('Brand deleted successfully');
        this.fetchBrands();
      },
      error: (err) => {
        console.error('Error deleting brand:', err);
      }
    });
  }

  onEdit(brandId: number): void {
    this.router.navigate(['/admin-side/edit-brand', brandId]);
  }
}