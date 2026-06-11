import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'http://192.168.0.246:8080/api/dealspot/categories';
  constructor(private http: HttpClient) { }

  addCategory(categoryData: FormData) {
    return this.http.post(`${this.apiUrl}/create`, categoryData);
  }
  getCategories(){
    return this.http.get(`${this.apiUrl}/fetch-categories`);
  }
}
