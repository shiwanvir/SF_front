import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../../core/app-config';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LayoutChangerService } from '../../../../core/service/layout-changer.service';
import { DatePipe } from '@angular/common';
import {transformMenu} from "@angular/material/menu";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-inventory-plantwise-currentdate',
  templateUrl: './inventory-plantwise-currentdate.component.html',
  styleUrls: ['./inventory-plantwise-currentdate.component.css'],
  providers: [DatePipe]
})
export class InventoryPlantwiseCurrentdateComponent implements OnInit {

  constructor(private http: HttpClient, private _route: ActivatedRoute,private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  myDate = new Date();
  anio:number = new Date().getFullYear()-1;
  //data: any[] = [];
  readonly apiUrl = AppConfig.apiUrl()
  ngOnInit() {
    this.titleService.setTitle("Inventory Values Plant-Wise")
    this.layoutChangerService.changeHeaderPath([
    'Inventory',
    'Inventory Values Plant-Wise' ])

    this.loadOtdPlantData();
    console.log(this._route.snapshot.queryParamMap.get('id'));

  }

  chartClicked(event){
    //console.log(this.customerArr[event.active[0]._index]);
    //console.log(event);
    //alert("s");
    //this.router.navigate(['home/taskstatussubone/'], { queryParams: { id:1} });
  }

  public pieChartLabels:string[] = [];
  public pieChartData = [];
  public pieChartType:string = 'doughnut';
  public pieChartOptions:any = [
  ];
  public colours = [
    {
      backgroundColor: [
        '#F47A1F',
        '#FDBB2F',
        '#377B2B',
        '#7AC142',
        '#007CC3',
        '#00529B'
     ],
     hoverBorderColor: [
       '#F47A1F',
       '#FDBB2F',
       '#377B2B',
       '#7AC142',
       '#007CC3',
       '#00529B'

     ],
     borderColor: [
       '#F47A1F',
       '#FDBB2F',
       '#377B2B',
       '#7AC142',
       '#007CC3',
       '#00529B'
    ],
    }
  ];

  loadOtdPlantData(){
  //  this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-plantwise-current-rm-otd').subscribe(response => {
  this.http.get(this.apiUrl + 'dashboard/dashboard?type=inventory-plantwise-currentdate&customer='+this._route.snapshot.queryParamMap.get('id')).subscribe(response => {
      var data = response;

      var count = Object.keys(data['cus_data']).length;
      for (var i = 0; i < count; i++) {

        this.pieChartLabels.push(data['cus_data'][i]['category_name']);
        this.pieChartData.push(data['cus_data'][i]['account_total']);
        //this.customerArr.push(data['cus_data'][i]['customer_id']);
      }
      console.log(response);
    });

  }

}
