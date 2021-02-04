import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../core/app-config';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
import { DatePipe } from '@angular/common';
import {transformMenu} from "@angular/material/menu";
import { MenuService } from '../../../core/layout/menu.service';

@Component({
  selector: 'app-sales-sub',
  templateUrl: './sales-sub.component.html',
  styleUrls: ['./sales-sub.component.css'],
  providers: [DatePipe]
})
export class SalesSubComponent implements OnInit {

  myDate = new Date();
  myDateToday = new Date().getFullYear();
  anio:number = new Date().getFullYear()-1;
  aniolasttwo:number = new Date().getFullYear()-2;
  aniolastthree:number = new Date().getFullYear()-3;

  public qrbar=0;

  constructor(private http: HttpClient,private menuService: MenuService, private router: Router,private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  data: any[] = [];
  readonly apiUrl = AppConfig.apiUrl()
  ngOnInit() {

    this.titleService.setTitle("Quartety Sale")
    this.layoutChangerService.changeHeaderPath([
    'Quartety Sale' ])

    // this.titleService.setTitle("Home")//set page title
    // //change header nevigation pagePath
    // this.layoutChangerService.changeHeaderPath([])
    // this.menuService.currentComponent = 'Dashboard'

    this.loadQuarterWise();
    this.loadQuarterWiseLastYear();
    this.loadQuarterWiseLastTwoYear();
    this.loadQuarterWisee();
    //this.loadQuarterMonthWise();
  }

  public indexone=0;
  public indextwo=0;
  public indexthree=0;
  public indexfour=0;
  //Quartely
  //public barChartLabels = ['Quarter']; //remove data to connect controller {'Q1'},{'Q2'},{'Q3'},{'Q4'}
  public barChartLabels = [];
  public barChartType = 'bar';
  public barChartLegend = false;
  public customerArr = [];
  //public barChartData= [1];
  public barChartData = [
 {data: [], label: 'Quartely Sales'},
 // {data: [], label: 'Q2'},
 // {data: [], label: 'Q3'},
 // {data: [], label: 'Q4'},
  ];

  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: false,
    title: {
     display: true,
     text:"Quartely Sales " +this.myDateToday
     },
    //legend: { display: false },
    scales: {
      yAxes: [{
        scaleLabel:  {
          display: true,
        },
        ticks: {
          min: 0,
          stepSize: 2000
        }
      }],
      xAxes: [{
          barPercentage: 0.5,
          categoryPercentage: 0.98,
      }],

    },
    colors: ['#ED402A', '#F0AB05'],
    click: function (event, elem) {
    }
  };
  public barChartColors: any [] =[
    {
      backgroundColor: [
        'rgba(255, 201,	102, 1)',
        'rgba(102, 178,	102, 1)',
        'rgba(255, 102,	102, 1)',
        'rgba(212, 38, 33, 0.5)',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 0.2)'
        ],
        hoverBorderColor: [
          'rgba(255, 183, 50, 1)',
          'rgba(50, 153,	50, 1)',
          'rgba(255, 76,	76, 1)',
          'rgba(255, 63, 57, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
        ],
       //  borderColor: [
       //    '#f0ad4e',
       //    '#5cb85c',
       //    '#d9534f',
       //    'rgba(255, 159, 64, 1)',
       //     'rgba(153, 102, 255, 1)',
       //     'rgba(255, 159, 64, 1)'
       // ],
    }
  ]
  //Last 1 qt_year
  public barChartLabels2 = [];
  public barChartType2 = 'bar';
  public barChartLegend2 = false;
  //public customerArr = [];
  /*public barChartData = [
 {data: [50], label: 'Purchase Order'},
 {data: [10], label: 'Costing'}
 ];*/
  public barChartData2 = [
    {data: [], label: 'Quartely Sales'}
  ];
  public barChartOptions2 = {
    scaleShowVerticalLines: false,
    responsive: false,
    title: {
     display: true,
     text: 'Quartely Sales '+this.anio
     },
    scales: {
      yAxes: [{
        scaleLabel:  {
          display: true,
        },
        ticks: {
          min: 0,
          stepSize: 2000
        }
      }]
    },
    colors: ['#ED402A', '#F0AB05'],
    click: function (event, elem) {
    }
  };
  public barChartColors2: any [] =[
    {
      backgroundColor: [
        '#f0ad4e',
        '#5cb85c',
        '#d9534f',
           '#76448A',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 0.2)'
        ],
        hoverBorderColor: [
          '#f0ad4e',
          '#5cb85c',
          '#d9534f',
              '#76448A',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
        ],
        borderColor: [
          '#f0ad4e',
          '#5cb85c',
          '#d9534f',
           '#76448A',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'
       ],
    }
  ]
  //last 2nd qt_year
  public barChartLabels3 = [];
  public barChartType3 = 'bar';
  public barChartLegend3 = false;
  //public customerArr = [];

  /*public barChartData = [
 {data: [50], label: 'Purchase Order'},
 {data: [10], label: 'Costing'}
 ];*/
  public barChartData3 = [
    {data: [], label: 'Quartely Sales'}
  ];
  public barChartOptions3 = {
    scaleShowVerticalLines: false,
    responsive: false,
    title: {
     display: true,
     text: 'Quartely Sales '+this.aniolasttwo
     },
    scales: {
      yAxes: [{
        scaleLabel:  {
          display: true,
        },
        ticks: {
          min: 0,
          stepSize: 2000
        }
      }]
    },
    colors: ['#ED402A', '#F0AB05'],
    click: function (event, elem) {
    }
  };
  public barChartColors3: any [] =[
    {
      backgroundColor: [
        '#f0ad4e',
        '#5cb85c',
        '#d9534f',
           '#76448A',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 0.2)'
        ],
        hoverBorderColor: [
          '#f0ad4e',
          '#5cb85c',
          '#d9534f',
              '#76448A',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
        ],
        borderColor: [
          '#f0ad4e',
          '#5cb85c',
          '#d9534f',
           '#76448A',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'
       ],
    }
  ]

  // events on slice click
  chartClicked(event){
  //debugger
  console.log(event.active[0]._index);

   if(event.active[0]._index==0)
    this.router.navigate(['./sales-q-four/'],);//sales-q-one
   if(event.active[0]._index==1)
    this.router.navigate(['./sales-q-two/'],);
   if(event.active[0]._index==2)
     this.router.navigate(['./sales-q-three/'],);
   if(event.active[0]._index==3)
     this.router.navigate(['./sales-q-four/'],);

    //console.log(event.active[0]._index);
    //this.customerArr[1]= console.log(event.active[0]._index);
    //console.log(event.active);
    //this.router.navigate(['home/main-item-sales-month/'], { queryParams: { id: 1} });//main-item-sales-month
  }
  chartClicked2(event){
    this.router.navigate(['./main-item-sales-month/']);
}
chartClicked3(event){
  this.router.navigate(['./sale-n-last-two-year/']);
}


  loadQuarterWisee() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarterby-quarter').subscribe(response => {//load-quarter-wise

          //this.barChartLabels.push(response['qqqq']['value']);
          // this.barChartData[0]['data'].push(response['q']['q4']);
          // this.barChartData[0]['data'].push(response['qq']['q2']);
          // this.barChartData[0]['data'].push(response['qqq']['q3']);
          // this.barChartData[0]['data'].push(response['qqqq']['q4']);

    });
  }

  loadQuarterWise() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-wise').subscribe(response => {//load-quarter-wise
      var data = response;
      console.log(response);
      for (var i = 0; i < response['data'].length; i++) {
        //console.log(this.data['cus_data']['customers'][i]);

        this.barChartLabels.push(response['data'][i]['qt_year']);
        this.barChartData[0]['data'].push(response['data'][i]['value']);
      }
    });
  }

  loadQuarterWiseLastYear() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-wise-lastyear').subscribe(response => {
      var data = response;
      console.log(response);
      for (var i = 0; i < response['data'].length; i++) {
        //console.log(this.data['cus_data']['customers'][i]);

        this.barChartLabels2.push(response['data'][i]['qt_year']);
        this.barChartData2[0]['data'].push(response['data'][i]['value']);

        //this.customerArr.push(data['cus_data']['customers'][i]['customer_id']);
        //alert(response['data'][i]['qt_year'])
      }

    });
  }

  loadQuarterWiseLastTwoYear() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-wise-lasttwoyear').subscribe(response => {
      var data = response;
      console.log(response);
      for (var i = 0; i < response['data'].length; i++) {
        //console.log(this.data['cus_data']['customers'][i]);

        this.barChartLabels3.push(response['data'][i]['qt_year']);
        this.barChartData3[0]['data'].push(response['data'][i]['value']);

        //this.customerArr.push(data['cus_data']['customers'][i]['customer_id']);
        //alert(response['data'][i]['qt_year'])
      }

    });
  }



}
