import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private apiUrl = environment.apiUrl + '/brands';
  constructor(private http: HttpClient) { }
  
  addBrand(brandData: FormData) {
    return this.http.post(`${this.apiUrl}/register-brand`, brandData);
  }

  getBrands(){
    return this.http.get(`${this.apiUrl}/fetch-brands`);
  }


  
}
