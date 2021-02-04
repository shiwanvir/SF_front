import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../../core/app-config';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute} from "@angular/router";
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LayoutChangerService } from '../../../../core/service/layout-changer.service';

@Component({
  selector: 'app-tasksubmenu-two',
  templateUrl: './tasksubmenu-two.component.html',
  styleUrls: ['./tasksubmenu-two.component.css']
})
export class TasksubmenuTwoComponent implements OnInit {

  public pieChartLabels:string[] = ['Pending', 'Approved','Rejected'];
  public pieChartData:number[] = [2,4,6];
  public pieChartType:string = 'doughnut';

  public pieChartOptions:any = [

  ];
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

  readonly apiUrl = AppConfig.apiUrl()

  constructor(private http: HttpClient, private router: Router,private titleService: Title, private layoutChangerService : LayoutChangerService) {

   }

  ngOnInit() {
    this.titleService.setTitle("Task Status")
    this.layoutChangerService.changeHeaderPath([
    'Task Status',
    'Task Status -Menu2' ])

    this.loadPoApprovalData();
  }

  chartClicked(event){
    //console.log(this.customerArr[event.active[0]._index]);
    //console.log(event);
    //alert("s");
    //this.router.navigate(['home/tasksubmenutwo/'], { queryParams: { id:1} });

  }


  loadPoApprovalData(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-po-approval').subscribe(response => {
      var data = response;

      //this.pieChartData.push(data['cus_data']['approved'][0]['approved']);
      //this.pieChartData.push(data['cus_data']['pending'][0]['pending']);

    });
    console.log(this.pieChartData);
  }

}
