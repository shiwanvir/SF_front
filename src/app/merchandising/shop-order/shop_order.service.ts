import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class ShopOrderService {

  private dataSource = new BehaviorSubject<any>(null)
  loadData = this.dataSource.asObservable()

  constructor() { }

  changeData(data){
    console.log(data)
    this.dataSource.next(data)
  }







}
