import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class StyleCreationService {

  private dataSource = new BehaviorSubject<any>(null)
  styleCreation = this.dataSource.asObservable()

  private popUpSource = new BehaviorSubject<string>(null)
  popUpLoad = this.popUpSource.asObservable()

  private popUpImageCrop = new BehaviorSubject<string>(null)
  popUpCrop = this.popUpImageCrop.asObservable()

  constructor() { }

  changeData(data){
    this.dataSource.next(data)
    //console.log(data)
  }

  popup(data){
    this.popUpSource.next(data)
    //console.log(data)
  }

  popupimagecrop(data){
    this.popUpImageCrop.next(data)
    //console.log(data)
  }



}
