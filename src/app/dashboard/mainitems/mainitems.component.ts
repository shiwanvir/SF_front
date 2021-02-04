import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../core/app-config';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute} from "@angular/router";
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-mainitems',
  templateUrl: './mainitems.component.html',
  styleUrls: ['./mainitems.component.css'],
  //styleUrls: ['./all.min.css']
})
export class MainitemsComponent implements OnInit {

 public salesvalues = 0;
 public costing = 5;
 public otd = 0;
 public rm = 0;
 public ival =0;
// public barChartData = [{data: [] };

  constructor(private http: HttpClient, private router: Router, private titleService: Title) { }


  //public data;
  data: any[] = [];
  readonly apiUrl = AppConfig.apiUrl()
  ngOnInit() {

    this.loadCustomerOrderDataValue();
    this.loadOtdData();
    this.loadRMData();
    this.loadInventoryData();
    this.titleService.setTitle("Dashboard")//set page title
    //this.pendingGrn = 100;
  }

  myClickFunction(event) {
    this.router.navigate(['./main-item-sale/']);
  }
  myClickFunctionOtd(event) {
    this.router.navigate(['./main-item-otd/']);
  }
  myClickFunctionRM(event) {
    this.router.navigate(['./main-item-rm/']);
  }
  myClickFunctionInv(event) {
    this.router.navigate(['./main-item-inventory-sub-plant/']);
  }

  loadCustomerOrderDataValue() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=customer-order-data-value').subscribe(response => {
      var data = response;

      if(response['total'] != null)
      this.salesvalues = response['total'];
      if(response['total'] == null)
      this.salesvalues = 0;

      console.log(response['total']);
    });
  }

  loadOtdData(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-otd').subscribe(response => {
      //var data = response;
      if(response['pass']['OTD'] != null)
      this.otd = response['pass']['OTD'];
      if(response['pass']['OTD'] == null)
      this.otd = 0;


      console.log(response['pass']['OTD']);
    });
  }

  loadRMData(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-RM').subscribe(response => {
      //var data = response;
      if(response['pass']['OTD'] != null)
      this.rm = response['pass']['OTD'];
      if(response['pass']['OTD'] == null)
      this.rm = 0;
      //this.rm=5;
      //console.log('sc');
      console.log(response['pass']['OTD']);
    });
  }

  loadInventoryData(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-inentorys').subscribe(response => {

      if(response['pass']['account_total'] != null)
      this.ival = response['pass']['account_total'];
      if(response['pass']['account_total'] == null)
      this.ival = 0;


      console.log(response['pass']['account_total']);
    });
  }

}
