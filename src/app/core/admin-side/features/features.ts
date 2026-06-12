import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class FeatureService {
  private apiUrl = environment.apiUrl + '/features';
  constructor(private http: HttpClient) { }

  addFeatures(feature:FormData){
    return this.http.post(`${this.apiUrl}/add-key`, feature)
  }
  getFeatures() {
  return this.http.get<any[]>(`${this.apiUrl}/fetch-attribute-keys`);
}
}
