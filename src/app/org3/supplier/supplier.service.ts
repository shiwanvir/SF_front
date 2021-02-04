import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  private dataSource = new BehaviorSubject<any>(null)
  supplierData = this.dataSource.asObservable()

  private statusChange = new BehaviorSubject<string>(null)
  status = this.statusChange.asObservable()

  private activeTab = new BehaviorSubject<string>(null)
  tab1 = this.activeTab.asObservable()

  constructor() { }

  changeData(data){
    this.dataSource.next(data)
  }

  changeStatus(status:string){
    this.statusChange.next(status)
  }

  tabActive(tabs:string){
    this.activeTab.next(tabs)
  }
//
}
