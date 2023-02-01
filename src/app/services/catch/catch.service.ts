import { Injectable, OnInit } from '@angular/core';
import { forkJoin, map, mergeMap, Observable, tap, of } from 'rxjs';
import { Catch } from '../../models/catch.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Fish } from 'src/app/models/fish.model';
import { Lake } from 'src/app/models/lake.model';
import { Lure } from 'src/app/models/lure.model';

@Injectable({
  providedIn: 'root',
})
export class CatchService {
  private apiUrl: string = environment.apiUrl || 'http://localhost:8080';
  constructor(private http: HttpClient) {}

  getCatches(): Observable<Catch[]> {
    return this.http
      .get<
        {
          id: number;
          fishId: number;
          lakeId: number;
          lureId: number;
          weight: number;
        }[]
      >(`${this.apiUrl}/catch/all`)
      .pipe(
        mergeMap((catchesData) => {
          return forkJoin(
            catchesData.map((catchData) => {
              return forkJoin({
                id: of(catchData.id),
                fish: this.http.get<Fish>(
                  `${this.apiUrl}/fish/find/${catchData.fishId}`
                ),
                lake: this.http.get<Lake>(
                  `${this.apiUrl}/lake/find/${catchData.lakeId}`
                ),
                lure: this.http.get<Lure>(
                  `${this.apiUrl}/lure/find/${catchData.lureId}`
                ),
                weight: of(catchData.weight),
              });
            })
          );
        }),
        map((catchDataArray) => {
          return catchDataArray.map((catchData) => {
            return {
              id: catchData.id,
              fish: catchData.fish,
              lake: catchData.lake,
              lure: catchData.lure,
              weight: catchData.weight,
            };
          });
        })
      );
  }

  public getCatchById(id: number): Observable<Catch> {
    return this.http.get<Catch>(`${this.apiUrl}/catch/find/${id}`);
  }

  public addCatch(newCatch: Catch): Observable<Catch> {
    return this.http.post<Catch>(`${this.apiUrl}/catch/add`, newCatch);
  }

  public updateCatch(updatedCatch: Catch): Observable<Catch> {
    return this.http.put<Catch>(`${this.apiUrl}/catch/update`, updatedCatch);
  }

  public deleteCatch(id: number): Observable<Catch> {
    return this.http.delete<Catch>(`${this.apiUrl}/catch/delete/${id}`);
  }
}
