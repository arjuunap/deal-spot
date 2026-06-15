import { ChangeDetectorRef, Component } from '@angular/core';
import { ProductService } from '../../../core/admin-side/Services/product/product';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-feature-list',
  imports: [FormsModule],
  templateUrl: './feature-list.html',
  styleUrl: './feature-list.css',
})
export class FeatureList {
  constructor(
    private productService: ProductService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  features: any[] = [];
  filteredFeatures: any[] = [];
  searchTerm = '';

  ngOnInit(): void {
    this.loadFeatures();
  }

  loadFeatures(): void {
    this.productService.getFeatures().subscribe({
      next: (data: any) => {
        this.features = data;
        this.filteredFeatures = [...data];
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching features:', err);
      }
    });
  }

  filterFeatures(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredFeatures = this.features.filter(feature =>
      feature.attrKeyEn?.toLowerCase().includes(term) ||
      feature.attrKeyAr?.toLowerCase().includes(term) ||
      feature.id?.toString().includes(term)
    );
  }

  addFeature() {
    this.router.navigate(['/admin-side/features']);
  }

  deleteFeature(featureId: number): void {
    this.productService.deleteFeature(featureId).subscribe({
      next: () => {
        this.loadFeatures();
      },
      error: (err) => {
        console.error('Error deleting feature:', err);
      }
    });
  }
}