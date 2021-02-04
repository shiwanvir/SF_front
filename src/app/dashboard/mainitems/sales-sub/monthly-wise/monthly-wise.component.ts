import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../../core/app-config';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LayoutChangerService } from '../../../../core/service/layout-changer.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-monthly-wise',
  templateUrl: './monthly-wise.component.html',
  styleUrls: ['./monthly-wise.component.css'],
  providers: [DatePipe]
})
export class MonthlyWiseComponent implements OnInit {
  anio:number = new Date().getFullYear()-1;
  myVar = 'https://www.w3schools.com';
  constructor(private http: HttpClient, private router: Router,private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  data: any[] = [];
  readonly apiUrl = AppConfig.apiUrl()
  ngOnInit() {

    this.titleService.setTitle("Quartely Sale Financial Year "+this.anio)
    this.layoutChangerService.changeHeaderPath([
    'Quartely Sale',
    'Quartely Sale Monthly Wise '+this.anio ])


    //this.loadQuarterMonthWise();
    this.loadQ1();
    this.loadQ2();
    this.loadQ3();
    this.loadQ4();
  }

  //Q1
  public barChartLabels1 = [];
  public barChartType1 = 'bar';
  public barChartLegend1 =  true;
  public customerArr = [];
  public barChartData1 = [
    {data: []},
    ];
  public barChartOptions1 = {
    title:  {
      display: true,
      text: "Q1",
    },
    scaleShowVerticalLines: false,
    responsive: false,
    legend: { display: false },
    scales: {
      yAxes: [{


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
  public barChartColors1: any [] =[
    {
      backgroundColor: [
        '#f0ad4e',
        '#5cb85c',
        '#d9534f',
           'rgba(212, 38, 33, 1)',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'
        ],
        hoverBorderColor: [
          '#f0ad4e',
          '#5cb85c',
          '#d9534f',
              'rgba(255, 63, 57, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'

        ],
        borderColor: [
          '#f0ad4e',
          '#5cb85c',
          '#d9534f',
           'rgba(212, 38, 33, 1)',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'
       ],
    }
  ]

  //Q2
  public barChartLabels2 = [];
  public barChartType2 = 'bar';
  public barChartLegend2 =  true;
  public customerArr2 = [];
  public barChartData2 = [
    {data: []},
    ];
  public barChartOptions2 = {
    title:  {
      display: true,
      text: "Q2",
    },
    scaleShowVerticalLines: false,
    responsive: false,
    legend: { display: false },
    scales: {
      yAxes: [{


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
           'rgba(212, 38, 33, 1)',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'
        ],
        hoverBorderColor: [
          '#f0ad4e',
          '#5cb85c',
          '#d9534f',
              'rgba(255, 63, 57, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'

        ],
        borderColor: [
          '#f0ad4e',
          '#5cb85c',
          '#d9534f',
           'rgba(212, 38, 33, 1)',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'
       ],
    }
  ]

  //Q3
  public barChartLabels3 = [];
  public barChartType3 = 'bar';
  public barChartLegend3 =  true;
  public customerArr3 = [];
  public barChartData3 = [
    {data: []},
    ];
  public barChartOptions3 = {
    title:  {
      display: true,
      text: "Q3",
    },
    scaleShowVerticalLines: false,
    responsive: false,
    legend: { display: false },
    scales: {
      yAxes: [{


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
           'rgba(212, 38, 33, 1)',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'
        ],
        hoverBorderColor: [
          '#f0ad4e',
          '#5cb85c',
          '#d9534f',
              'rgba(255, 63, 57, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'

        ],
        borderColor: [
          '#f0ad4e',
          '#5cb85c',
          '#d9534f',
           'rgba(212, 38, 33, 1)',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'
       ],
    }
  ]

  //Q4
  public barChartLabels4 = [];
  public barChartType4 = 'bar';
  public barChartLegend4 =  true;
  public customerArr4 = [];
  public barChartData4 = [
    {data: []},
    ];
  public barChartOptions4 = {
    title:  {
      display: true,
      text: "Q4",
    },
    scaleShowVerticalLines: false,
    responsive: false,
    legend: { display: false },
    scales: {
      yAxes: [{


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
  public barChartColors4: any [] =[
    {
      backgroundColor: [
        '#f0ad4e',
        '#5cb85c',
        '#d9534f',
           'rgba(212, 38, 33, 1)',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'
        ],
        hoverBorderColor: [
          '#f0ad4e',
          '#5cb85c',
          '#d9534f',
              'rgba(255, 63, 57, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'

        ],
        borderColor: [
          '#f0ad4e',
          '#5cb85c',
          '#d9534f',
           'rgba(212, 38, 33, 1)',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'
       ],
    }
  ]

  // events on slice click
  chartClicked(event){
    //console.log(this.customerArr[event.active[0]._index]);
    //this.router.navigate(['home/main-item-sales-month/'], { queryParams: { id: this.customerArr[event.active[0]._index] } });
  }

  loadQuarterMonthWise() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-month-wise').subscribe(response => {
      var data = response;
      console.log(response);

      for (var i = 0; i < response['data'].length; i++) {
        //console.log(this.data['cus_data']['customers'][i]);

        //this.barChartLabels4.push(response['data'][i]['ym']);
        //this.barChartData4[0]['data'].push(response['data'][i]['value']);

      }

    });
  }

  loadQ1() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-1-last').subscribe(response => {
      var data = response;
      console.log(response);

      for (var i = 0; i < response['data'].length; i++) {
        //console.log(this.data['cus_data']['customers'][i]);

        this.barChartLabels1.push(response['data'][i]['ym']);
        this.barChartData1[0]['data'].push(response['data'][i]['value']);

      }

    });
  }

  loadQ2() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-2-last').subscribe(response => {
      var data = response;
      console.log(response);

      for (var i = 0; i < response['data'].length; i++) {
        //console.log(this.data['cus_data']['customers'][i]);

        this.barChartLabels2.push(response['data'][i]['ym']);
        this.barChartData2[0]['data'].push(response['data'][i]['value']);

      }

    });
  }

  loadQ3() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-3-last').subscribe(response => {
      var data = response;
      console.log(response);

      for (var i = 0; i < response['data'].length; i++) {
        //console.log(this.data['cus_data']['customers'][i]);

        this.barChartLabels3.push(response['data'][i]['ym']);
        this.barChartData3[0]['data'].push(response['data'][i]['value']);

      }

    });
  }

  loadQ4() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-4').subscribe(response => {
      var data = response;
      console.log("s");
      console.log(response);

      for (var i = 0; i < response['data'].length; i++) {
        //console.log(this.data['cus_data']['customers'][i]);

        this.barChartLabels4.push(response['data'][i]['ym']);
        this.barChartData4[0]['data'].push(response['data'][i]['value']);

      }

    });
  }

}
