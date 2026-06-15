import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environment/environment';
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = environment.apiUrl + '/products';
  constructor(private http: HttpClient) { }


  addProduct(productData: FormData) {
    return this.http.post(`${this.apiUrl}/add-product`, productData);
  }

  getProducts() {
    return this.http.get(`${this.apiUrl}/fetch-all-products`);
  }
  updateProduct(productId: number, productData: FormData) {
    return this.http.put(`${this.apiUrl}/update-product/${productId}`, productData);
  }
  getProductById(productId: number) {
    return this.http.get(`${this.apiUrl}/fetch-product/${productId}`);
  }


  addFeatures(feature: FormData) {
    return this.http.post(`${this.apiUrl}/add-key`, feature)
  }
  getFeatures() {
    return this.http.get<any[]>(`${this.apiUrl}/fetch-attribute-keys`);
  }
  deleteFeature(featureId: number) {
    return this.http.delete(`${this.apiUrl}/delete-attribute-key/${featureId}`);
  }

}
