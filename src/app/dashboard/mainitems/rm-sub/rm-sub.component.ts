import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../core/app-config';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-rm-sub',
  templateUrl: './rm-sub.component.html',
  styleUrls: ['./rm-sub.component.css'],
  providers: [DatePipe]
})
export class RmSubComponent implements OnInit {

  myDate = new Date();
  anio:number = new Date().getFullYear()-1;
  public pieChartLabels:string[] = ['On-Time Delivery', 'Late'];
  public pieChartData:number[] = [1,2];//dummy data
  public pieChartType:string = 'doughnut';

  public pieChartOptions:any = [

  ];
  public colours = [
    {
      backgroundColor: [
        '#377B2B',
        '#7AC142',
		'#5cb85c',
        '#337ab7',
        '#337ab7',
        'rgba(212, 38, 33, 0.5)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
     ],
     hoverBorderColor: [
       '#377B2B',
       '#7AC142',
	   '#5cb85c',
       '#337ab7',
       '#337ab7',
           'rgba(255, 63, 57, 1)',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'

     ],
     borderColor: [
       '#377B2B',
       '#7AC142',
	   '#5cb85c',
       '#337ab7',
       '#337ab7',
        'rgba(212, 38, 33, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ],
    }
  ];

  readonly apiUrl = AppConfig.apiUrl()

  constructor(private http: HttpClient, private router: Router,private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.titleService.setTitle("RM In-Date")
    this.layoutChangerService.changeHeaderPath([
    'Rm In-Date' ])


    this.loadRmData();
    this.loadRMDatalast();
    this.loadRMDatalasttwo();
  }

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
  public pieChartData3:number[] = [1,2];
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

  chartClicked1(event){
      if(event.active[0]._index==0)
      this.router.navigate(['./plant-wise-rm-otd/']);
      if(event.active[0]._index==1)
      this.router.navigate(['./plant-wise-rm-ld/']);

  }
  chartClicked2(event){
      if(event.active[0]._index==0)
      this.router.navigate(['./plant-wise-rm-otd-tocurrent/']);
      if(event.active[0]._index==1)
      this.router.navigate(['./plant-wise-rm-ld-tocurrent/']);
  }
  chartClicked3(event){
      if(event.active[0]._index==0)
      this.router.navigate(['./plant-wise-rm-otd-lastyear/']);
      if(event.active[0]._index==1)
      this.router.navigate(['./plant-wise-rm-ld-lastyear/']);
  }



  loadRmData(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-RM-Data').subscribe(response => {

      //this.pieChartData.push(response['pass']['OTD']);
      //this.pieChartData.push(response['fail']['OTD']);

      console.log(response['pass']['OTD']);
    });

}
loadRMDatalast(){
  this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-rm-lastyear').subscribe(response => {//load-rm-lastyear

    this.pieChartData2.push(response['pass']['OTD']);
    this.pieChartData2.push(response['fail']['OTD']);

    console.log(response['pass']['OTD']);
  });

}

loadRMDatalasttwo(){
  this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-rm-last-twoyear').subscribe(response => {

    //this.pieChartData3.push(response['pass']['OTD']);
    //this.pieChartData3.push(response['fail']['OTD']);

    //console.log("ds")
    console.log(response['pass']['OTD']);
  });

}
}
