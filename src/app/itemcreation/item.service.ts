import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private dataSourceMaterial = new BehaviorSubject<any>(null)
  materialList = this.dataSourceMaterial.asObservable()

  private dataSourceItem = new BehaviorSubject<any>(null)
  itemList = this.dataSourceItem.asObservable()

  constructor() { }

  reloadMaterialList(data){
    this.dataSourceMaterial.next(data)
  }

  reloadItemList(data){
    this.dataSourceItem.next(data)
  }
}
