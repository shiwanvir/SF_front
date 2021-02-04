import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class LayoutChangerService {

  recentPages = [];

  constructor() { }

  private dataSource = new BehaviorSubject<any>(false)
  headerMinButtonEvent = this.dataSource.asObservable()

  private dataSource2 = new BehaviorSubject<Array<string>>(null)
  pagePath = this.dataSource2.asObservable()

  private dataSource3 = new BehaviorSubject<Array<any>>([])
  recentPages$ = this.dataSource3.asObservable()

  private dataSource4 = new BehaviorSubject<Array<any>>([])
  changeLink = this.dataSource4.asObservable()

  headerButtonClick(_data : boolean = true){
      this.dataSource.next(_data)
  }

  changeHeaderPath(data:Array<string>){
    this.dataSource2.next(data)
    //debugger
  }

  addRecentPage(url){
    if(this.recentPages.length >= 10){
      this.recentPages.pop()
    }
    this.recentPages.unshift(url)
    this.dataSource3.next(this.recentPages)
  }

  changeLinkPath(url){
    this.dataSource4.next(url)
  }

}
