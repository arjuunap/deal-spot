import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Product {
  private apiUrl = 'http://192.168.0.246:8080/api/dealspot/products';
  constructor(private http: HttpClient) { }


  addProduct(productData: FormData) {
    return this.http.post(`${this.apiUrl}/add-product`, productData);
  }

  getProducts(){
    return this.http.get(`${this.apiUrl}/fetch-products`);
  }
}
