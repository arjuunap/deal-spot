import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = environment.apiUrl + '/categories';
  constructor(private http: HttpClient) { }

  addCategory(categoryData: FormData) {
    return this.http.post(`${this.apiUrl}/create`, categoryData);
  }
  getCategories(){
    return this.http.get(`${this.apiUrl}/fetch-categories`);
  }
}
