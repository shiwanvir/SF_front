import { Component, OnInit , OnDestroy ,ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { map,takeUntil } from 'rxjs/operators';
import { Observable,Subject} from 'rxjs';
import { TabsetComponent,TabDirective } from 'ngx-bootstrap';

import { CustomerService } from './customer.service';
import { AppAlert } from '../../core/class/app-alert';
import { AppConfig } from '../../core/app-config';
import { CustomerListComponent } from './customer-list.component';


@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit,OnDestroy {

  customerData = null
  @ViewChild('tabs') tabs: TabsetComponent;
  @ViewChild(CustomerListComponent) customerList: CustomerListComponent;
  selectedDivisionList$ : Observable<any>
  notSelectedDivisionList$ : Observable<any>

  destroySubject$: Subject<void> = new Subject();

  apiUrl = AppConfig.apiUrl()

  constructor(private customerService:CustomerService , private http:HttpClient, private titleService: Title) { }

  ngOnInit() {

    this.customerService.customerData
    .pipe(takeUntil(this.destroySubject$))
    .subscribe(data => {
      this.customerData = data
      if(data != null && data != '') {
        this.loadSelectedCustomerDivisions()
        this.loadNotSelectedCustomerDivisions()
        this.tabs.tabs[1].active = true;
        this.tabs.tabs[2].disabled = false
        this.titleService.setTitle('Customer Creation')
      }
      else{
        this.tabs.tabs[0].active = true;
        this.tabs.tabs[2].disabled = true
        this.titleService.setTitle('Customer')
      }
    })
  }

  onSelect(data: TabDirective): void {

    if(data.heading == 'Customers'){
        this.customerList.reloadTable()
    }

  }


  ngOnDestroy(){
    //this.customerService.customerData.
   //this.customerService.changeData(null)
   this.destroySubject$.next();
   this.destroySubject$.complete()
   this.customerService.changeData(null)
   this.customerService.changeStatus(null)
 }


  loadSelectedCustomerDivisions(){
    let data = { customer_id : this.customerData['customer_id'] , type : 'selected'}
    this.selectedDivisionList$ = this.http.get<any>(this.apiUrl + 'org/customers/divisions', {params : data})
    .pipe( map(res => res['data']))
  }

  loadNotSelectedCustomerDivisions() {
    let data = { customer_id : this.customerData['customer_id'] }
    this.notSelectedDivisionList$ = this.http.get<any>(this.apiUrl + 'org/customers/divisions' , {params : data})
    .pipe( map(res => res['data']))
  }

  saveDivisionList(data) {
    let submitData = {
      divisions : data,
      customer_id : this.customerData['customer_id']
    }
    this.http.put(this.apiUrl + 'org/customers/divisions', submitData).subscribe(
      data => {
        AppAlert.showSuccess({text : 'Customer Divisions Saved Successfully'})
      },
      error => { console.log(error) }
    )
  }
}
