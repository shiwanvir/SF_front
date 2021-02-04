import{Injectable} from'@angular/core';
import{BehaviorSubject}from'rxjs';

@Injectable({
  providedIn:'root'
})

export class NonInvGrnService{
 private dataSource= new BehaviorSubject<any>(null);
 grnData=this.dataSource.asObservable()
 constructor(){

 }
changeData(data){
  //debugger
  this.dataSource.next(data)
}

}
