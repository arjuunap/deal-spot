import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
@Injectable({
  providedIn: 'root',
})
export class Product {
  private apiUrl = environment.apiUrl + '/products';
  constructor(private http: HttpClient) { }


  addProduct(productData: FormData) {
    return this.http.post(`${this.apiUrl}/add-product`, productData);
  }

  getProducts(){
    return this.http.get(`${this.apiUrl}/fetch-all-products`);
  }
}
