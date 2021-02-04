import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class IssueService{

  private dataSource = new BehaviorSubject<any>(null)
  issueData = this.dataSource.asObservable()

  private statusChange = new BehaviorSubject<string>(null)
  status = this.statusChange.asObservable()

  constructor() { }

  changeData(data){
    this.dataSource.next(data)
  }

  changeStatus(status:string){
    this.statusChange.next(status)
  }

}
