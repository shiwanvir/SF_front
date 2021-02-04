import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class CostingService {

  private dataSource = new BehaviorSubject<any>(null)
  costingId = this.dataSource.asObservable()

  private dataSourceList = new BehaviorSubject<any>(null)
  costingList = this.dataSourceList.asObservable()

  constructor() { }

  changeCostingId(data){
    this.dataSource.next(data)
  }

  reloadCostingList(data){
    this.dataSourceList.next(data)
  }

}
