import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class BuyerPoService {

  private dataSource = new BehaviorSubject<any>(null)
  poData = this.dataSource.asObservable()

  private statusChange = new BehaviorSubject<string>(null)
  status = this.statusChange.asObservable()

  private lineSource = new BehaviorSubject<string>(null)
  lineData = this.lineSource.asObservable()

  private splitLineSource = new BehaviorSubject<string>(null)
  splitLineData = this.splitLineSource.asObservable()

  private splitStatusChange = new BehaviorSubject<boolean>(false)
  splitStatus = this.splitStatusChange.asObservable()

  private revisionLineSource = new BehaviorSubject<string>(null)
  revisionLineData = this.revisionLineSource.asObservable()

  constructor() { }

  changeData(data,vali){
    //var x =  data +"|"+vali;
    var x =  { id: data, check : vali}
    //console.log(x)
    this.dataSource.next(x)
  }

  changeStatus(status:string){
    this.statusChange.next(status)
  }

  changeLineData(data){
    this.lineSource.next(data)
  }

  changeSplitLineData(data){
    this.splitLineSource.next(data)
  }

  changeSplitStatus(status:boolean){
    this.splitStatusChange.next(status)
  }

  changeRevisionLineData(data){
    this.revisionLineSource.next(data)
  }

}
