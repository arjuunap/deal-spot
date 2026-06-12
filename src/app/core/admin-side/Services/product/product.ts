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

  getProducts(){
    return this.http.get(`${this.apiUrl}/fetch-all-products`);
  }
  
  addFeatures(feature:FormData){
    return this.http.post(`${this.apiUrl}/add-key`, feature)
  }
  getFeatures() {
  return this.http.get<any[]>(`${this.apiUrl}/fetch-attribute-keys`);
}
}
