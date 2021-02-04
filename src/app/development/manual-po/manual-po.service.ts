import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'


@Injectable({
  providedIn: 'root'
})
export class ManualPoService {

  private dataSource = new BehaviorSubject<any>(null)
  poData = this.dataSource.asObservable()

  private dataSource2 = new BehaviorSubject<any>(null)
  poData2 = this.dataSource2.asObservable()

  private statusChange = new BehaviorSubject<string>(null)
  status = this.statusChange.asObservable()

  private lineSource = new BehaviorSubject<string>(null)
  lineData = this.lineSource.asObservable()

  private loadOrder = new BehaviorSubject<string>(null)
  loadData = this.loadOrder.asObservable()

  constructor() { }

  changeData(data,confrm){
    //var x =  data +"|"+vali;
    var x =  { id: data , status: confrm}
    //console.log(x)
    this.dataSource.next(x)
  }

  changeData2(data,confrm){
    //var x =  data +"|"+vali;
    var x =  { id: data , status: confrm}
    //console.log(x)
    this.dataSource2.next(x)
  }

  changeStatus(status:string){
    this.statusChange.next(status)
  }

  changeLineData(data){
    this.lineSource.next(data)
  }

  loadOrderData(data){
    this.loadOrder.next(data)
  }
}
