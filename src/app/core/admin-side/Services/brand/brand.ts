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
  deleteBrand(brandId: number) {
    return this.http.delete(`${this.apiUrl}/delete-brand/${brandId}`);
  }

  getBrandById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateBrand(id: number, brandData: FormData) {
    return this.http.patch(`${this.apiUrl}/update-brand/${id}`, brandData);
  }


  
}
