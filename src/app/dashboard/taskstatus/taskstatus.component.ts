import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../core/app-config';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-taskstatus',
  templateUrl: './taskstatus.component.html',
  styleUrls: ['./taskstatus.component.css']
})
export class TaskstatusComponent implements OnInit {

  public pieChartLabels:string[] = ['Pending', 'Approved','Rejected'];
  public pieChartData:number[] = [];
  public pieChartType:string = 'doughnut';

  public pieChartOptions:any = [

  ];
  public colours = [
    {
      backgroundColor: [
        'rgba(255, 201,	102, 1)',
        'rgba(102, 178,	102, 1)',
        'rgba(255, 102,	102, 1)',
        'rgba(212, 38, 33, 0.5)',
        'rgba(153, 102, 255, 0.2)',
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
    //     '#f0ad4e',
    //     '#5cb85c',
    //     '#d9534f',
    //     'rgba(212, 38, 33, 1)',
    //     'rgba(153, 102, 255, 1)',
    //     'rgba(255, 159, 64, 1)'
    // ],
    }
  ];

  readonly apiUrl = AppConfig.apiUrl()

  constructor(private http: HttpClient, private router: Router,private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.loadPoApprovalData();
  }

  getElementsAtEvent(event){

    //debugger;
    //console.log(this.customerArr[event.active[0]._index]);
    // console.log(event);
    // this.router.navigate(['./taskstatussubone/']);

    if(event.active[0]._index==0)
    this.router.navigate(['./task-status-pending/']);
    if(event.active[0]._index==1)
    this.router.navigate(['./taskstatussubone/']);
    if(event.active[0]._index==2)
    this.router.navigate(['./task-status-rejected/']);

  }


  loadPoApprovalData(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-po-approval').subscribe(response => {
      var data = response;

      this.pieChartData.push(data['cus_data']['pending'][0]['pending']);
      this.pieChartData.push(data['cus_data']['approved'][0]['approved']);
      this.pieChartData.push(data['cus_data']['rejected'][0]['rejected']);

    });
    console.log(this.pieChartData);
  }

}
