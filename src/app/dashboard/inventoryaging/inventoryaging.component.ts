import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../core/app-config';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-inventoryaging',
  templateUrl: './inventoryaging.component.html',
  styleUrls: ['./inventoryaging.component.css']
})
export class InventoryagingComponent implements OnInit {

    constructor(private http: HttpClient, private router: Router,private titleService: Title,
      private layoutChangerService : LayoutChangerService) { }

  public pieChartLabels:string[] = ['0-30', '30-60', '60-90', '90-120', '120+'];
  public pieChartData:number[] = [1,4,7,5];
  public pieChartType:string = 'doughnut';

  public pieChartOptions:any = [

  ];
  public colours = [
    {
      backgroundColor: [
        'rgba(255, 201, 102, 0.9)',
        'rgba(255, 76, 76, 0.9)',
        'rgba(102, 178, 102, 0.9)',
        'rgba(102, 102, 255, 0.9)',
        'rgba(178, 102, 178, 0.9)'

      ],
      hoverBorderColor: [
        'rgba(255, 183, 50, 1)',
        'rgba(255, 50, 50, 1)',
        'rgba(50, 153, 50, 1)',
        'rgba(50, 50, 255, 1)',
        'rgba(153, 50, 153, 1)'

      ],
     //  borderColor: [
     //    '#F47A1F',
     //    '#FDBB2F',
     //    '#377B2B',
     //    '#7AC142',
     //    '#007CC3',
     //    '#00529B'
     // ],
    }
  ];

  readonly apiUrl = AppConfig.apiUrl()

  //constructor(private http: HttpClient) { }

  ngOnInit() {

    this.loadPoApprovalData();
    
  }

  chartClicked(event){

    this.router.navigate(['./inventorysubone/'], { queryParams: { id:this.pieChartData[event.active[0]._index] } });

  }

  loadPoApprovalData(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-po-approval').subscribe(response => {
      var data = response;

      this.pieChartData.push(data['cus_data']['approved'][0]['approved']);
      this.pieChartData.push(data['cus_data']['pending'][0]['pending']);
      //this.customerArr.push(data['cus_data'][i]['customer_id']);

    });
    console.log(this.pieChartData);
  }




 //  constructor(private http: HttpClient, private router: Router) { }
 //
 //  ngOnInit() {
 //    this.loadOrderStatus();
 //  }
 //
 //  readonly apiUrl = AppConfig.apiUrl()
 //  public barChartLabels = [];
 //  public barChartType = 'bar';
 //  public barChartLegend = true;
 //
 //  public customerArr = [];
 //
 //
 //  /*public barChartData = [
 // {data: [50], label: 'Purchase Order'},
 // {data: [10], label: 'Costing'}
 //
 // ];*/
 //  public barChartData = [
 //    {data: [], label: 'Pending SMV'}
 //  ];
 //
 //  public barChartOptions = {
 //    scaleShowVerticalLines: false,
 //    responsive: false,
 //    /*title: {
 //     display: true,
 //     text: 'Edit Mode Costings/Purchase Order'
 //     },*/
 //
 //    scales: {
 //      yAxes: [{
 //        scaleLabel:  {
 //          display: true,
 //
 //        },
 //        ticks: {
 //          min: 0,
 //          stepSize: 1
 //        }
 //      }]
 //    },
 //    colors: ['#ED402A', '#F0AB05'],
 //    click: function (event, elem) {
 //    }
 //
 //  };
 //
 //  public barChartColors: any [] =[
 //    {
 //      backgroundColor: [
 //        'rgba(255, 99, 132, 0.5)',
 //        'rgba(54, 162, 235, 0.5)',
 //        'rgba(28, 84, 47, 0.5)',
 //        'rgba(212, 38, 33, 0.5)',
 //        'rgba(153, 102, 255, 0.2)',
 //        'rgba(255, 159, 64, 0.2)'
 //     ],
 //     hoverBorderColor: [
 //         'rgba(255, 99, 132, 1)',
 //           'rgba(54, 162, 235, 1)',
 //           'rgba(255, 206, 86, 1)',
 //           'rgba(255, 63, 57, 1)',
 //           'rgba(153, 102, 255, 1)',
 //           'rgba(255, 159, 64, 1)'
 //
 //     ],
 //     borderColor: [
 //        'rgba(255, 99, 132, 1)',
 //        'rgba(54, 162, 235, 1)',
 //        'rgba(38, 121, 67, 1)',
 //        'rgba(212, 38, 33, 1)',
 //        'rgba(153, 102, 255, 1)',
 //        'rgba(255, 159, 64, 1)'
 //    ],
 //    }
 //  ]
 //
 //  // events on slice click
 //  chartClicked(event){
 //    //console.log(this.customerArr[event.active[0]._index]);
 //    this.router.navigate(['home/inventorysubone/'], { queryParams: { id: this.customerArr[event.active[0]._index] } });
 //  }
 //
 //
 //
 //  loadOrderStatus(){
 //    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-order-status').subscribe(response => {
 //      var data = response;
 //
 //      var count = Object.keys(data['cus_data']).length;
 //
 //      for (var i = 0; i < count; i++) {
 //       // console.log(data['cus_data'][i]['customer_name']);
 //        this.barChartLabels.push(data['cus_data'][i]['customer_short_name']);
 //        this.barChartData[0]['data'].push(data['cus_data'][i]['count']);
 //        this.customerArr.push(data['cus_data'][i]['customer_id']);
 //      }
 //
 //    });
 //  }

}
