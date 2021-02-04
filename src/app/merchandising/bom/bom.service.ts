import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class BomService {

  private lineSource = new BehaviorSubject<string>(null)
  lineData = this.lineSource.asObservable()

  private dataSource = new BehaviorSubject<any>(null)
  bomId = this.dataSource.asObservable()

  constructor() { }

  changeLineData(data){
    this.lineSource.next(data)
  }

  changeBomId(data){
    this.dataSource.next(data)
  }

}
