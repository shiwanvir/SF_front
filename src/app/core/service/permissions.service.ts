import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  private _permissionStore: Array<string> = [];
  private _permissionStoreChange: EventEmitter<any> = new EventEmitter();

  constructor() {
    let _permissions = this.getPermissionsFromLocalStorage();
    if(_permissions != null){
      this.define(_permissions)
    }
  }

  public define(permissions: Array<string>): void {
        if (!Array.isArray(permissions))
            throw "permissions parameter is not array.";

        this.clearStore();
        for (let permission of permissions)
            this.add(permission);
    }

    public add(permission: string): void {
        if (typeof permission === "string" && !this.hasDefined(permission.toUpperCase())) {
            this._permissionStore.push(permission.toUpperCase());
            this._permissionStoreChange.emit(null);
        }
    }

    public remove(permission: string): void {
        if (typeof permission !== "string")
            return;

        let index = this._permissionStore.indexOf(permission.toUpperCase());
        if (index < 0)
            return;

        this._permissionStore.splice(index, 1);
        this._permissionStoreChange.emit(null);
    }

    public hasDefined(permission: string): boolean {
        if (typeof permission !== "string")
            return false;

        let index = this._permissionStore.indexOf(permission.toUpperCase());
        return index > -1;
    }

    public hasOneDefined(permissions: Array<string>, permissionList: Array<string>): boolean {
        if (!Array.isArray(permissions))
            throw "permissions parameter is not array.";

        return permissions.some(v => {
            if (typeof v === "string")
            return this._permissionStore.indexOf(v.toUpperCase()) >= 0;
              //  return permissionList.indexOf(v.toUpperCase()) >= 0;
        });
    }

    public clearStore(): void {
        this._permissionStore = [];
    }

    get store(): Array<string> {
        return this._permissionStore;
    }

    get permissionStoreChangeEmitter(): EventEmitter<any> {
        return this._permissionStoreChange;
    }

    public storePermissionsToLocalStorage(_permissions){
      localStorage.setItem('permissions' , JSON.stringify(_permissions))
    }

    public getPermissionsFromLocalStorage(){
      let _permissions = localStorage.getItem('permissions');
      if(_permissions == undefined || _permissions == null){
        return null
      }
      else{
        return JSON.parse(_permissions)
      }
    }

    public removePermissionsFromLocalStorage(){
      localStorage.removeItem('permissions')
    }
}
