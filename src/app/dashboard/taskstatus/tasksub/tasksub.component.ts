import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../core/app-config';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute} from "@angular/router";
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LayoutChangerService } from '../../../core/service/layout-changer.service';

@Component({
  selector: 'app-tasksub',
  templateUrl: './tasksub.component.html',
  styleUrls: ['./tasksub.component.css']
})
export class TasksubComponent implements OnInit {

  // public pieChartLabels:string[] = [];
  // public pieChartData:number[] = [];
  // public pieChartType:string = 'doughnut';

  public pieChartLabels1:string[] = [];
  public pieChartData1:number[] = [];
  public pieChartType1:string = 'doughnut';
  public pieChartOptions1:any = [];

  // public pieChartLabels2:string[] = ["s"];
  // public pieChartData2:number[] = [1];
  // public pieChartType2:string = 'doughnut';

  // public pieChartOptions:any = [
  //
  // ];
  // public colours = [
  //   {
  //     backgroundColor: [
  //       '#f0ad4e',
  //       '#5cb85c',
  //       '#d9534f',
  //       '#337ab7',
  //       'rgba(153, 102, 255, 0.2)',
  //       'rgba(255, 159, 64, 0.2)'
  //    ],
  //    hoverBorderColor: [
  //      '#f0ad4e',
  //      '#5cb85c',
  //      '#d9534f',
  //          '#337ab7',
  //          'rgba(153, 102, 255, 1)',
  //          'rgba(255, 159, 64, 1)'
  //
  //    ],
  //    borderColor: [
  //      '#f0ad4e',
  //      '#5cb85c',
  //      '#d9534f',
  //       '#337ab7',
  //       'rgba(153, 102, 255, 1)',
  //       'rgba(255, 159, 64, 1)'
  //   ],
  //   }
  // ];
  public colours1 = [
    {
      backgroundColor: [
        'rgba(255, 201,	102, 0.2)',
        'rgba(102, 178,	102, 0.2)',
        'rgba(255, 102,	102, 0.2)',
        '#337ab7',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 102,	102 0.2)'
     ],
     hoverBorderColor: [
       'rgba(255, 183, 50, 0.2)',
       'rgba(50, 153,	50, 0.2)',
       'rgba(255, 76,	76, 0.2)',
           '#337ab7',
           'rgba(153, 102, 255, 1)',
           'rgba(255, 159, 64, 1)'

     ],
    //  borderColor: [
    //    '#5cb85c',
    //    '#5cb85c',
    //    '#d9534f',
    //     '#337ab7',
    //     'rgba(153, 102, 255, 1)',
    //     'rgba(255, 159, 64, 1)'
    // ],
    }
  ];
  // public colours2 = [
  //   {
  //     backgroundColor: [
  //       '#d9534f',
  //       '#5cb85c',
  //       '#f0ad4e',
  //       '#337ab7',
  //       'rgba(153, 102, 255, 1)',
  //       'rgba(255, 159, 64, 1)',
  //       '#34495E'
  //    ],
  //    hoverBorderColor: [
  //      '#d9534f',
  //      '#5cb85c',
  //      '#f0ad4e',
  //      '#337ab7',
  //      'rgba(153, 102, 255, 1)',
  //      'rgba(255, 159, 64, 1)',
  //      '#34495E'
  //
  //    ],
  //    borderColor: [
  //      '#d9534f',
  //      '#5cb85c',
  //      '#f0ad4e',
  //      '#337ab7',
  //      'rgba(153, 102, 255, 1)',
  //      'rgba(255, 159, 64, 1)',
  //      '#34495E'
  //   ],
  //   }
  // ];

  readonly apiUrl = AppConfig.apiUrl()

  constructor(private http: HttpClient, private router: Router,private titleService: Title, private layoutChangerService : LayoutChangerService) {

   }

  ngOnInit() {

    this.titleService.setTitle("Task Status: Approved")
    this.layoutChangerService.changeHeaderPath([
    'Task Status: Approved' ])

    //this.loadPoApprovalData();
    //this.loadPendingDetails();
    this.loadApprovedDetails();
    //this.loadRejectedDetails();
  }

  chartClicked(event){

    //this.router.navigate(['./tasksubmenutwo/']);

  }


  loadPoApprovalData(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-po-approval').subscribe(response => {
      var data = response;

      //this.pieChartData.push(data['cus_data']['approved'][0]['approved']);
      //this.pieChartData.push(data['cus_data']['pending'][0]['pending']);

    });
    //console.log(this.pieChartData);
  }
  // loadPendingDetails(){
  //   this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-Pending-cie').subscribe(response => {
  //     var data = response;
  //     var count = Object.keys(data['cus_data']).length;
  //
  //     for (var i = 0; i < count; i++) {
  //       this.pieChartLabels.push(data['cus_data'][i]['process']);
  //       this.pieChartData.push(data['cus_data'][i]['count']);
  //     }
  //     console.log(response['cus_data']);
  //   });
  //
  // }
  loadApprovedDetails(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-Approved-cie').subscribe(response => {
      var data = response;
      var count = Object.keys(data['cus_data']).length;

      for (var i = 0; i < count; i++) {
        this.pieChartLabels1.push(data['cus_data'][i]['process']);
        this.pieChartData1.push(data['cus_data'][i]['count']);
      }
      console.log(response['cus_data']);
    });

  }
  // loadRejectedDetails(){
  //   this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-Rejected-cie').subscribe(response => {
  //     var data = response;
  //     var count = Object.keys(data['cus_data']).length;
  //
  //     for (var i = 0; i < count; i++) {
  //       this.pieChartLabels2.push(data['cus_data'][i]['process']);
  //       this.pieChartData2.push(data['cus_data'][i]['count']);
  //     }
  //     console.log(response['cus_data']);
  //   });
  //
  // }

}
