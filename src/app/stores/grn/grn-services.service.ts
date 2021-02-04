import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class GrnServicesService {

  private dataSource = new BehaviorSubject<any>(null)
  grnData = this.dataSource.asObservable()

  constructor() { }

  changeData(data){
    this.dataSource.next(data)
  }
}
