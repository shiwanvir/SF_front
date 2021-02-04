import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../../core/app-config';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LayoutChangerService } from '../../../../core/service/layout-changer.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-quarter-four',
  templateUrl: './quarter-four.component.html',
  styleUrls: ['./quarter-four.component.css'],
  providers: [DatePipe]
})
export class QuarterFourComponent implements OnInit {

  myDate = new Date().getFullYear();
  myDateLast = new Date().getFullYear()-1;
  myDateLastTwo = new Date().getFullYear()-2;
  myDateLastThree = new Date().getFullYear()-3;

  constructor(private http: HttpClient, private router: Router,private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  data: any[] = [];
  readonly apiUrl = AppConfig.apiUrl()
  ngOnInit() {

    this.titleService.setTitle("Quarter Four ")
    this.layoutChangerService.changeHeaderPath([
    'Quartely Sale',
    'Quarter Four' ])

    this.loadQ4();
    this.loadQ5();
    this.loadQ6();
  }

  //Q4 current
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
      text: "Quarter Year - "+this.myDateLast,
    },
    scaleShowVerticalLines: false,
    responsive: true,
    legend: { display: false },
    scales: {
      yAxes: [{


        ticks: {
          min: 0,
          stepSize: 20000
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
        'rgba(249, 178,	0, 0.9)',
        'rgba(204, 132,	0, 0.9)',
        'rgba(178, 115,	0, 0.9)'

        ],
        hoverBorderColor: [
          '#895900',
          '#724900',
          '#5b3b00'

        ],
       //  borderColor: [
       //    '#F47A1F',
       //    '#FDBB2F',
       //    '#377B2B',
       //
       // ],
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
      text: 'Quarter Year '+this.myDateLastTwo,
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
      text: 'Quarter Year '+this.myDateLastThree,
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

  loadQ4() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-4').subscribe(response => {
      var data = response;
      // console.log("s");
      // console.log(response);

      for (var i = 0; i < response['data'].length; i++) {
        this.barChartLabels4.push(response['data'][i]['ym']);
        this.barChartData4[0]['data'].push(response['data'][i]['value']);

      }

    });
  }

  loadQ5() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-4-last').subscribe(response => {
      var data = response;
      // console.log("s");
      // console.log(response);

      for (var i = 0; i < response['data'].length; i++) {
        this.barChartLabels5.push(response['data'][i]['ym']);
        this.barChartData5[0]['data'].push(response['data'][i]['value']);

      }

    });
  }

  loadQ6() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-4-lasttwo').subscribe(response => {
      var data = response;
      // console.log("s");
      // console.log(response);

      for (var i = 0; i < response['data'].length; i++) {
        this.barChartLabels6.push(response['data'][i]['ym']);
        this.barChartData6[0]['data'].push(response['data'][i]['value']);

      }

    });
  }

}
