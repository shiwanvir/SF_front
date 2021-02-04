import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../../core/app-config';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LayoutChangerService } from '../../../../core/service/layout-changer.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-load-rm-plantwise-ld-tocurrent',
  templateUrl: './load-rm-plantwise-ld-tocurrent.component.html',
  styleUrls: ['./load-rm-plantwise-ld-tocurrent.component.css'],
  providers: [DatePipe]
})
export class LoadRmPlantwiseLdTocurrentComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router,private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  myDate = new Date();
  anio:number = new Date().getFullYear()-1;
  data: any[] = [];
  readonly apiUrl = AppConfig.apiUrl()
  ngOnInit() {
    this.titleService.setTitle("RM Plant Wise LD")
    this.layoutChangerService.changeHeaderPath([
    'RM In-Date',
    'RM Plant Wise LD' ])

    this.loadOtdPlantData();

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
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-plantwise-current-rm-ld').subscribe(response => {
      var data = response;

      var count = Object.keys(data['cus_data']).length;
      for (var i = 0; i < count; i++) {

        this.pieChartLabels.push(data['cus_data'][i]['loc_name']);
        this.pieChartData.push(data['cus_data'][i]['OTD']);
        //this.customerArr.push(data['cus_data'][i]['customer_id']);
      }
      console.log(response);
    });

  }

}
