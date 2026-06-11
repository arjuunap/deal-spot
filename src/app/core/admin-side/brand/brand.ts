import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private apiUrl = 'http://192.168.0.246:8080/api/dealspot/brands';
  constructor(private http: HttpClient) { }
  
  addBrand(brandData: FormData) {
    return this.http.post(`${this.apiUrl}/register-brand`, brandData);
  }

  getBrands(){
    return this.http.get(`${this.apiUrl}/fetch-brands`);
  }


  
}
