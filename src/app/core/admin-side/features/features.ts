import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FeatureService {
  private apiUrl = 'http://192.168.0.246:8080/api/dealspot/products';
  constructor(private http: HttpClient) { }

  addFeatures(feature:FormData){
    return this.http.post(`${this.apiUrl}/add-key`, feature)
  }
}
