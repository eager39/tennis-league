import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { isPlatformBrowser } from '@angular/common';
@Injectable({
  providedIn: 'root'
  
})

export class AuthService {
  private jwtHelper = new JwtHelperService();
  private apiUrl = environment.apiUrl// Your backend API

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) { }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  logout() {
    localStorage.removeItem('token');
  }
  

  isAuthenticated(): boolean {
    const token = this.getToken();
   
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }
  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) {
      return [];
    }
    const decodedToken = this.jwtHelper.decodeToken(token);

    return decodedToken.role ? decodedToken.role : "";
  }
  getUserId(): number {
    const token = this.getToken();
    if (!token) {
      return 0;
    }
    const decodedToken = this.jwtHelper.decodeToken(token);
   
    return decodedToken.id;
  }
  getUserEmail(): number {
    const token = this.getToken();
    if (!token) {
      return 0;
    }
    const decodedToken = this.jwtHelper.decodeToken(token);
   
    return decodedToken.email;
  }
  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }
  userMatchesPlayer(name: string): boolean{
    const token = this.getToken();
    if (!token) {
      return false;

    }
    const decodedToken = this.jwtHelper.decodeToken(token);
    if(decodedToken.role=="admin"){
      return true
    }
    if(this.compareNames(decodedToken.name,name)){
      return decodedToken.role ? decodedToken.role : "";
    }else{
      return false
    }
    
  }


  getToken(): string | null {
    let token
    if (isPlatformBrowser(this.platformId)) {
      token= localStorage.getItem('token'); 
     }
      if(token){
        return token
      }else{
        return ""
      }
      
      
  
    
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }
  compareNames(name1: string, name2: string): boolean {
    // Normalize names (case-insensitive and handling diacritics)
    const normalized1 = this.normalizeName(name1);
    const normalized2 = this.normalizeName(name2);

    // Split the names into components
    const nameParts1 = normalized1.split(' ').sort();
    const nameParts2 = normalized2.split(' ').sort();

    // Compare the sorted name parts
    return this.areArraysEqual(nameParts1, nameParts2);
  }

  private normalizeName(name: string): string {
    // Normalize by lowercasing and removing accents
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private areArraysEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }

    return true;
  }

}