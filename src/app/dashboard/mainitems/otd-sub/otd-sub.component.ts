import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../core/app-config';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-otd-sub',
  templateUrl: './otd-sub.component.html',
  styleUrls: ['./otd-sub.component.css'],
  providers: [DatePipe]
})
export class OtdSubComponent implements OnInit {

 myDate = new Date();
 anio:number = new Date().getFullYear()-1;
 public otdpass = 0;
 public otdfail = 0;

  public pieChartLabels:string[] = ['On-Time Delivery', 'Late'];
  public pieChartData:number[] = [];
  public pieChartType:string = 'doughnut';
  public pieChartOptions:any = [
  ];
  public colours = [
    {
      backgroundColor: [
        '#377B2B',
        '#7AC142',
        '#f0ad4e',
        '#d9534f',
        '#d9534f',
        'rgba(212, 38, 33, 0.5)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
     ],
     hoverBorderColor: [
       '#377B2B',
       '#7AC142',
       '#f0ad4e',
       '#d9534f',
       '#d9534f',
           'rgba(255, 63, 57, 1)',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'
     ],
     borderColor: [
       '#377B2B',
       '#7AC142',
        '#f0ad4e',
        '#d9534f',
        '#d9534f',
        'rgba(212, 38, 33, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ],
    }
  ];

  public pieChartLabels2:string[] = ['OTD','LD'];
  public pieChartData2:number[] = [];
  public pieChartType2:string = 'doughnut';
  public pieChartOptions2:any = [
  ];
  public colours2 = [
    {
      backgroundColor: [
        '#377B2B',
        '#7AC142',
        '#f0ad4e',
        '#d9534f',
        '#d9534f',
        'rgba(212, 38, 33, 0.5)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
     ],
     hoverBorderColor: [
       '#377B2B',
       '#7AC142',
       '#f0ad4e',
       '#d9534f',
       '#d9534f',
           'rgba(255, 63, 57, 1)',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'
     ],
     borderColor: [
       '#377B2B',
       '#7AC142',
        '#f0ad4e',
        '#d9534f',
        '#d9534f',
        'rgba(212, 38, 33, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ],
    }
  ];
  public pieChartLabels3:string[] = ['OTD','LD'];
  public pieChartData3:number[] = [];
  public pieChartType3:string = 'doughnut';
  public pieChartOptions3:any = [
  ];
  public colours3 = [
    {
      backgroundColor: [
        '#377B2B',
        '#7AC142',
        '#f0ad4e',
        '#d9534f',
        '#d9534f',
        'rgba(212, 38, 33, 0.5)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
     ],
     hoverBorderColor: [
       '#377B2B',
       '#7AC142',
       '#f0ad4e',
       '#d9534f',
       '#d9534f',
           'rgba(255, 63, 57, 1)',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'
     ],
     borderColor: [
       '#377B2B',
       '#7AC142',
        '#f0ad4e',
        '#d9534f',
        '#d9534f',
        'rgba(212, 38, 33, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ],
    }
  ];


  constructor(private http: HttpClient, private router: Router,private titleService: Title, private layoutChangerService : LayoutChangerService) { }
  data: any[] = [];
  readonly apiUrl = AppConfig.apiUrl()

  ngOnInit() {
    this.titleService.setTitle("On-Time Delivery")
    this.layoutChangerService.changeHeaderPath([
    'On-Time Delivery' ])

    this.loadOtdData();
    this.loadOtdDatalast();
    this.loadOtdDatalasttwo();
  }

  chartClicked(event){
    //console.log(this.customerArr[event.active[0]._index]);
    //console.log(event);
    //alert("s");
    if(event.active[0]._index==0)
    this.router.navigate(['./plant-wise-currentdate/']);
    if(event.active[0]._index==1)
    this.router.navigate(['./plant-wise-currentdate-ld/']);


  }

  chartClicked2(event){
    //console.log(this.customerArr[event.active[0]._index]);
    //console.log(event);
    //alert("s");
    if(event.active[0]._index==0)
    this.router.navigate(['./plant-wise-otd-until-currentdate/']);
    if(event.active[0]._index==1)
    this.router.navigate(['./plant-wise-ld-until-currentdate/']);

  }

  chartClicked3(event){
    //console.log(this.customerArr[event.active[0]._index]);
    //console.log(event);
    //alert("s");
    if(event.active[0]._index==0)
    this.router.navigate(['./plant-wise-otd-in-lastyear/']);
    if(event.active[0]._index==1)
    this.router.navigate(['./plant-wise-ld-in-lastyear/']);

  }


  loadOtdData(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-otd').subscribe(response => {
      var data = response;
      //this.otdpass = response['pass']['OTD'];
      //this.otdfail = response['fail']['OTD'];

      this.pieChartData.push(response['pass']['OTD']);
      this.pieChartData.push(response['fail']['OTD']);

      //this.pieChartData.push(data['cus_data']['otd'][0]['pending']);

      console.log(response['pass']['OTD']);
    });

  }

  loadOtdDatalast(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-otd-lastyear').subscribe(response => {

      this.pieChartData2.push(response['pass']['OTD']);
      this.pieChartData2.push(response['fail']['OTD']);

      console.log(response['pass']['OTD']);
    });

  }

  loadOtdDatalasttwo(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-otd-lasttwoyear').subscribe(response => {

      this.pieChartData3.push(response['pass']['OTD']);
      this.pieChartData3.push(response['fail']['OTD']);

      //console.log("ds")
      console.log(response['pass']['OTD']);
    });

  }
}
