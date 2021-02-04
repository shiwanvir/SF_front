import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../core/app-config';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute} from "@angular/router";
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';

@Component({
  selector: 'app-rejected-task',
  templateUrl: './rejected-task.component.html',
  styleUrls: ['./rejected-task.component.css']
})
export class RejectedTaskComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router,private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  readonly apiUrl = AppConfig.apiUrl()
  ngOnInit() {
    this.titleService.setTitle("Task Status: Rejected")
    this.layoutChangerService.changeHeaderPath([
    'Task Status',
    'Task Status: Rejected' ])
    this.loadRejectedDetails();
  }

  public pieChartLabels:string[] = [];
  public pieChartData:number[] = [];
  public pieChartType:string = 'doughnut';
  public pieChartOptions:any = [];

  public colours = [
    {
      backgroundColor: [
        '#f0ad4e',
        '#5cb85c',
        '#d9534f',
        '#337ab7',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
     ],
     hoverBorderColor: [
       '#f0ad4e',
       '#5cb85c',
       '#d9534f',
           '#337ab7',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'

     ],
     borderColor: [
       '#f0ad4e',
       '#5cb85c',
       '#d9534f',
        '#337ab7',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ],
    }
  ];

  chartClicked(event){
    //console.log(this.customerArr[event.active[0]._index]);
    //console.log(event);
    //alert("s");
    //  this.router.navigate(['./tasksubmenutwo/'], { queryParams: { id:1} });

  }

  loadRejectedDetails(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-Rejected-cie').subscribe(response => {
      var data = response;
      var count = Object.keys(data['cus_data']).length;

      for (var i = 0; i < count; i++) {
        this.pieChartLabels.push(data['cus_data'][i]['process']);
        this.pieChartData.push(data['cus_data'][i]['count']);
      }
      console.log(response['cus_data']);
    });

  }

}
