import { ChangeDetectorRef, Component } from '@angular/core';
import { BrandService } from '../../../core/admin-side/Services/brand/brand';
import { Router } from '@angular/router';
import { environment } from '../../../../environment/environment';

@Component({
  selector: 'app-brand-list',
  imports: [],
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
  path: string = environment.filePath;;


  ngOnInit(): void {
    this.fetchBrands();
  }
  fetchBrands(): void {
    this.brandService.getBrands().subscribe({
      next: (data: any) => {
        this.brands = data;
        this.cd.detectChanges();
        console.log('Fetched brands:', data);
      },
      error: (err) => {
        console.error('Error fetching brands:', err);
      }
    });
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

  // editBrand(brandId: number):void {
  //   this.router.navigate(['/admin-side/brand/edit', brandId]);
  // }

  // onEdit(brandId: number): void {
  //   this.router.navigate(['/admin-side/edit-product', brandId]);
  // }
  onEdit(brandId: number): void {
    this.router.navigate(['/admin-side/edit-brand', brandId]);
  }



}
