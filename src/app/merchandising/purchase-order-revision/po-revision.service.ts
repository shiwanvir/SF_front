import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class PorevisionService {

  private dataSource = new BehaviorSubject<any>(null)
  lineData = this.dataSource.asObservable()

  private prlsplitLineSource = new BehaviorSubject<string>(null)
          contextMenuSplit = this.prlsplitLineSource.asObservable()



  constructor() { }

  changeData(data){
    this.dataSource.next(data)
    //alert('ddd')
  }

  changeContextMenuSplit(data){
    this.prlsplitLineSource.next(data)
    //console.log(data)
  }





}
