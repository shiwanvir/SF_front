import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../../core/app-config';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LayoutChangerService } from '../../../../core/service/layout-changer.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-quarter-one',
  templateUrl: './quarter-one.component.html',
  styleUrls: ['./quarter-one.component.css'],
  providers: [DatePipe]
})
export class QuarterOneComponent implements OnInit {

  myDate = new Date().getFullYear();
  myDateLast = new Date().getFullYear()-1;
  myDateLastTwo = new Date().getFullYear()-2;
 myDateLastThree = new Date().getFullYear()-3;
  constructor(private http: HttpClient, private router: Router,private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  data: any[] = [];
  readonly apiUrl = AppConfig.apiUrl()
  ngOnInit() {
    this.titleService.setTitle("Quarter One")
    this.layoutChangerService.changeHeaderPath([
    'Quartely Sale',
    'Quarter One' ])

    this.loadQ1();
    this.loadQ5();
    this.loadQ6();
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
      text: "Current Financial Year - "+ this.myDateLast,
    },
    scaleShowVerticalLines: false,
    responsive: true,
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
        '#F47A1F',
        '#FDBB2F',
        '#377B2B',
        ],
        hoverBorderColor: [
          '#F47A1F',
          '#FDBB2F',
          '#377B2B',
        ],
        borderColor: [
          '#F47A1F',
          '#FDBB2F',
          '#377B2B',
       ],
    }
  ]

  //Q4 last
  public barChartLabels5 = [];
  public barChartType5 = 'bar';
  public barChartLegend5 =  true;
  public customerArr5 = [];
  public barChartData5 = [
    {data: []},
    ];
  public barChartOptions5 = {
    title:  {
      display: true,
      text: "Financial Year - "+this.myDateLastTwo,
    },
    scaleShowVerticalLines: false,
    responsive: true,
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
  public barChartColors5: any [] =[
    {
      backgroundColor: [
        '#F47A1F',
        '#FDBB2F',
        '#377B2B',

        ],
        hoverBorderColor: [
          '#F47A1F',
          '#FDBB2F',
          '#377B2B',

        ],
        borderColor: [
          '#F47A1F',
          '#FDBB2F',
          '#377B2B',

       ],
    }
  ]

  //Q4 lasttwo
  public barChartLabels6 = [];
  public barChartType6 = 'bar';
  public barChartLegend6 =  true;
  public customerArr6 = [];
  public barChartData6 = [
    {data: []},
    ];
  public barChartOptions6 = {
    title:  {
      display: true,
      text: "Financial Year - "+this.myDateLastThree,
    },
    scaleShowVerticalLines: false,
    responsive: true,
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
  public barChartColors6: any [] =[
    {
      backgroundColor: [
        '#F47A1F',
        '#FDBB2F',
        '#377B2B',

        ],
        hoverBorderColor: [
          '#F47A1F',
          '#FDBB2F',
          '#377B2B',

        ],
        borderColor: [
          '#F47A1F',
          '#FDBB2F',
          '#377B2B',
             ],
    }
  ]

  chartClicked(event){
    //this.router.navigate(['home/main-item-inventory-plant-wise/']);
  }

  loadQ1() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-1').subscribe(response => {
      var data = response;
      console.log(response);

      for (var i = 0; i < response['data'].length; i++) {
        this.barChartLabels1.push(response['data'][i]['ym']);
        this.barChartData1[0]['data'].push(response['data'][i]['value']);
      }
    });
  }

  loadQ5() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-1-last').subscribe(response => {
      var data = response;
      for (var i = 0; i < response['data'].length; i++) {
        this.barChartLabels5.push(response['data'][i]['ym']);
        this.barChartData5[0]['data'].push(response['data'][i]['value']);

      }
    });
  }

  loadQ6() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-1-lasttwo').subscribe(response => {
      var data = response;
      for (var i = 0; i < response['data'].length; i++) {
      this.barChartLabels6.push(response['data'][i]['ym']);
      this.barChartData6[0]['data'].push(response['data'][i]['value']);

      }
    });
  }

}
