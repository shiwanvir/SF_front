import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../../core/app-config';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LayoutChangerService } from '../../../../core/service/layout-changer.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-quarter-two',
  templateUrl: './quarter-two.component.html',
  styleUrls: ['./quarter-two.component.css'],
  providers: [DatePipe]
})
export class QuarterTwoComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router,private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  myDate = new Date().getFullYear();
  myDateLast = new Date().getFullYear()-1;
  myDateLastTwo = new Date().getFullYear()-2;
  myDateLastThree = new Date().getFullYear()-3;

  data: any[] = [];
  readonly apiUrl = AppConfig.apiUrl()
  ngOnInit() {

    this.titleService.setTitle("Quarter Two")
    this.layoutChangerService.changeHeaderPath([
    'Quartely Sale',
    'Quarter Two' ])

    this.loadQ2();
    this.loadQ5();
    this.loadQ6();
  }

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
      text: "Current Financial Year - "+this.myDateLast,
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
  public barChartColors2: any [] =[
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
      text: this.myDateLastTwo,
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
      text: this.myDateLastThree,
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

  loadQ2() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-2').subscribe(response => {
      var data = response;
      console.log(response);

      for (var i = 0; i < response['data'].length; i++) {
        this.barChartLabels2.push(response['data'][i]['ym']);
        this.barChartData2[0]['data'].push(response['data'][i]['value']);
      }
    });
  }

  loadQ5() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-2-last').subscribe(response => {
      var data = response;

      for (var i = 0; i < response['data'].length; i++) {
        this.barChartLabels5.push(response['data'][i]['ym']);
        this.barChartData5[0]['data'].push(response['data'][i]['value']);

      }
    });
  }

  loadQ6() {
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-quarter-2-lasttwo').subscribe(response => {
      var data = response;

      for (var i = 0; i < response['data'].length; i++) {
        this.barChartLabels6.push(response['data'][i]['ym']);
        this.barChartData6[0]['data'].push(response['data'][i]['value']);
      }
    });
  }

}
