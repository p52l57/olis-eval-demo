import { HttpClient } from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { Legislation, Legislator } from '../model/osl_data';

@Injectable()
export class osl {
  private http = inject(HttpClient);
  //clearly we'll read this from config
  private readonly baseURL:string = 'http://127.0.0.1:5000';

  public getBills():Observable<Legislation[]>{
	return this.http.get<Legislation[]>(`${this.baseURL}/legislation`);
  }
  public getLegislators():Observable<Legislator[]>{
	return this.http.get<Legislator[]>(`${this.baseURL}/legislator`);
  }
  public addLegislator(cman:Legislator):Observable<Legislator>{
	return this.http.post<Legislator>(`${this.baseURL}/legislator`, cman);
  }
  public addBill(bill:Legislation):Observable<number>{
	return this.http.post<number>(`${this.baseURL}/legislation`, bill);
  }
}