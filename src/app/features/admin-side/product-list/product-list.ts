import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { ProductService } from '../../../core/admin-side/Services/product/product';
import { environment } from '../../../../environment/environment';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductList implements OnInit {
  products: any[] = [];
  isLoading: boolean = true;
  path: string =  environment.filePath; ;

  constructor(
    private productService: ProductService,
    private router: Router,
    private cd: ChangeDetectorRef,
      
  ) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    console.log('Fetching products from the server...');
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data: any) => {
        this.products = data;
        this.isLoading = false;
        this.cd.detectChanges(); // Ensure the view updates with the new products
        console.log('Products loaded:', this.products);
      },
      error: (error) => {
        console.error('Error fetching products', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to load products from the server.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  // Navigate to the edit route (e.g., /admin/products/edit/123)
  onEdit(productId: number): void {
    // Adjust this route based on your actual routing setup
    this.router.navigate(['/admin/products/edit', productId]);
  }

  // Delete with SweetAlert Confirmation
  // onDelete(productId: number, productName: string): void {
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: `Do you really want to delete ${productName}? This action cannot be undone.`,
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#d33',
  //     cancelButtonColor: '#3085d6',
  //     confirmButtonText: 'Yes, delete it!'
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       // Replace '.deleteProduct' with your actual service method name
  //       this.productService.deleteProduct(productId).subscribe({
  //         next: () => {
  //           Swal.fire(
  //             'Deleted!',
  //             'The product has been deleted.',
  //             'success'
  //           );
  //           // Remove the product from the UI without reloading the page
  //           this.products = this.products.filter(p => p.id !== productId);
  //         },
  //         error: (error) => {
  //           console.error('Error deleting product:', error);
  //           Swal.fire(
  //             'Failed!',
  //             'There was a problem deleting the product.',
  //             'error'
  //           );
  //         }
  //       });
  //     }
  //   });
  // }
}