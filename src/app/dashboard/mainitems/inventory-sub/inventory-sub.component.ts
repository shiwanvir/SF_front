import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../core/app-config';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-inventory-sub',
  templateUrl: './inventory-sub.component.html',
  styleUrls: ['./inventory-sub.component.css'],
  providers: [DatePipe]
})
export class InventorySubComponent implements OnInit {

  myDate = new Date();
  anio:number = new Date().getFullYear()-1;

  data: any[] = [];

  public customerArr1 = [];
  public pieChartLabels:string[] = [];
  public pieChartData = [];
  public pieChartType:string = 'doughnut';
  public pieChartOptions:any = [
  ];
  public colours = [
    {
      backgroundColor: [
        '#9BBFE0',
        '#E8A09A',
        '#FBE29F',
        '#C6D68F',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
     ],
     hoverBorderColor: [
       '#9BBFE0',
       '#E8A09A',
       '#FBE29F',
       '#C6D68F',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'
     ],
     borderColor: [
       '#9BBFE0',
       '#E8A09A',
       '#FBE29F',
       '#C6D68F',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ],
    }
  ];

  //last1
  public pieChartLabels2:string[] = [];
  public pieChartData2 = [];
  public pieChartType2:string = 'doughnut';
  public pieChartOptions2:any = [
  ];
  public customerArr2 = [];
  public colours2 = [
    {
      backgroundColor: [
        '#9BBFE0',
        '#E8A09A',
        '#FBE29F',
        '#C6D68F',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
     ],
     hoverBorderColor: [
       '#9BBFE0',
       '#E8A09A',
       '#FBE29F',
       '#C6D68F',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'
     ],
     borderColor: [
       '#9BBFE0',
       '#E8A09A',
       '#FBE29F',
       '#C6D68F',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ],
    }
  ];

  //last2
  public customerArr3 = [];
  public pieChartLabels3:string[] = [];
  public pieChartData3 = [];
  public pieChartType3:string = 'doughnut';
  public pieChartOptions3:any = [
  ];
  public colours3 = [
    {
      backgroundColor: [
        '#9BBFE0',
        '#E8A09A',
        '#FBE29F',
        '#C6D68F',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
     ],
     hoverBorderColor: [
       '#9BBFE0',
       '#E8A09A',
       '#FBE29F',
       '#C6D68F',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'
     ],
     borderColor: [
       '#9BBFE0',
       '#E8A09A',
       '#FBE29F',
       '#C6D68F',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ],
    }
  ];

  readonly apiUrl = AppConfig.apiUrl()

  constructor(private http: HttpClient, private router: Router,private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.titleService.setTitle("Inventory Values")
    this.layoutChangerService.changeHeaderPath([
    'Inventory Values' ])

    this.loadinvPlantData();
    this.loadinvPlantDataLast();
    this.loadinvPlantDataLastTwo();
  }

  chartClicked1(event){
    //this.router.navigate(['./main-item-inventory-plant-wise/']);
    this.router.navigate(['./plant-wise-inventory-currentdate/'], { queryParams: { id: this.customerArr1[event.active[0]._index] } });
  }
  chartClicked2(event){
    // if(event.active[0]._index==0)
    // this.router.navigate(['./inventory-plantwise-tocurrent/']);
    // if(event.active[0]._index==1)
    // this.router.navigate(['./inventory-plantwise-tocurrent/']);
    // if(event.active[0]._index==2)
    // this.router.navigate(['./inventory-plantwise-tocurrent/']);
    // if(event.active[0]._index==3)
    // this.router.navigate(['./inventory-plantwise-tocurrent/']);
    // if(event.active[0]._index==4)
    // this.router.navigate(['./inventory-plantwise-tocurrent/']);
    // if(event.active[0]._index==5)
    // this.router.navigate(['./inventory-plantwise-tocurrent/']);
    // if(event.active[0]._index==6)
    // this.router.navigate(['./inventory-plantwise-tocurrent/']);
    //console.log(this.customerArr[event.active[0]._index])
    this.router.navigate(['./plant-wise-inventory-current/'], { queryParams: { id: this.customerArr2[event.active[0]._index] } });
  }
  chartClicked3(event){
    //this.router.navigate(['./inventory-lastyear/']);
      this.router.navigate(['./plant-wise-inventory-lastyear/'], { queryParams: { id: this.customerArr3[event.active[0]._index] } });
  }

  loadinvPlantData(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-inv-Plant').subscribe(response => { //load-inv-Plant
      var data = response;

      //this.datee = response['cus_data']['CURRENT DATE()'];
      var count = Object.keys(data['cus_data']).length;
      for (var i = 0; i < count; i++) {

        this.pieChartLabels.push(data['cus_data'][i]['loc_name']);
        this.pieChartData.push(data['cus_data'][i]['account_total']);
        this.customerArr1.push(data['cus_data'][i]['loc_id']);
      }
      console.log(response);
    });
  }

  loadinvPlantDataLast(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-inv-Plant-lastyear').subscribe(response => {
      var data = response;
      var count = Object.keys(data['cus_data']).length;
      for (var i = 0; i < count; i++) {

        this.pieChartLabels2.push(data['cus_data'][i]['loc_name']);
        this.pieChartData2.push(data['cus_data'][i]['account_total']);
        this.customerArr2.push(data['cus_data'][i]['loc_id']);
      }
      console.log(response);
    });
  }

  loadinvPlantDataLastTwo(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-inv-Plant-lasttwoyear').subscribe(response => {//load-inv-Plant-lasttwoyear
      var data = response;
      var count = Object.keys(data['cus_data']).length;
      for (var i = 0; i < count; i++) {

        this.pieChartLabels3.push(data['cus_data'][i]['loc_name']);
        this.pieChartData3.push(data['cus_data'][i]['account_total']);
        this.customerArr3.push(data['cus_data'][i]['loc_id']);
      }
      console.log(response);
    });
  }

}
