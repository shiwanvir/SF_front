import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class BinTransferService {

  private dataSource = new BehaviorSubject<any>(null)
  id = this.dataSource.asObservable()

  constructor() { }

  changeData(data){
    this.dataSource.next(data)
  }


}
