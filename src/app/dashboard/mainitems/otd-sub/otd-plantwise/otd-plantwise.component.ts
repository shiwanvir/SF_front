import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../../core/app-config';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LayoutChangerService } from '../../../../core/service/layout-changer.service';

@Component({
  selector: 'app-otd-plantwise',
  templateUrl: './otd-plantwise.component.html',
  styleUrls: ['./otd-plantwise.component.css']
})
export class OtdPlantwiseComponent implements OnInit {

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
 //P1
  public pieChartLabels1:string[] = ['OTD','LD'];
  public pieChartData1 = [];
  public pieChartType1:string = 'doughnut';
  public pieChartOptions1:any = [
  ];
  public colours1 = [
    {
      backgroundColor: [
        '#377B2B',
        '#7AC142',
        '#377B2B',
        '#7AC142',
        '#007CC3',
        '#00529B'
     ],
     hoverBorderColor: [
       '#377B2B',
       '#7AC142',
       '#377B2B',
       '#7AC142',
       '#007CC3',
       '#00529B'

     ],
     borderColor: [
       '#377B2B',
       '#7AC142',
       '#377B2B',
       '#7AC142',
       '#007CC3',
       '#00529B'
    ],
    }
  ];
  //P2
   public pieChartLabels2:string[] = ['OTD','LD'];
   public pieChartData2 = [];
   public pieChartType2:string = 'doughnut';
   public pieChartOptions2:any = [
   ];
   public colours2 = [
     {
       backgroundColor: [
         '#377B2B',
         '#7AC142',
         '#377B2B',
         '#7AC142',
         '#007CC3',
         '#00529B'
      ],
      hoverBorderColor: [
        '#377B2B',
        '#7AC142',
        '#377B2B',
        '#7AC142',
        '#007CC3',
        '#00529B'

      ],
      borderColor: [
        '#377B2B',
        '#7AC142',
        '#377B2B',
        '#7AC142',
        '#007CC3',
        '#00529B'
     ],
     }
   ];
   //P3
    public pieChartLabels3:string[] = ['OTD','LD'];
    public pieChartData3 = [];
    public pieChartType3:string = 'doughnut';
    public pieChartOptions3:any = [
    ];
    public colours3 = [
      {
        backgroundColor: [
          '#377B2B',
          '#7AC142',
          '#377B2B',
          '#7AC142',
          '#007CC3',
          '#00529B'
       ],
       hoverBorderColor: [
         '#377B2B',
         '#7AC142',
         '#377B2B',
         '#7AC142',
         '#007CC3',
         '#00529B'

       ],
       borderColor: [
         '#377B2B',
         '#7AC142',
         '#377B2B',
         '#7AC142',
         '#007CC3',
         '#00529B'
      ],
      }
    ];
    //P4
     public pieChartLabels4:string[] = ['OTD','LD'];
     public pieChartData4 = [];
     public pieChartType4:string = 'doughnut';
     public pieChartOptions4:any = [
     ];
     public colours4 = [
       {
         backgroundColor: [
           '#377B2B',
           '#7AC142',
           '#377B2B',
           '#7AC142',
           '#007CC3',
           '#00529B'
        ],
        hoverBorderColor: [
          '#377B2B',
          '#7AC142',
          '#377B2B',
          '#7AC142',
          '#007CC3',
          '#00529B'

        ],
        borderColor: [
          '#377B2B',
          '#7AC142',
          '#377B2B',
          '#7AC142',
          '#007CC3',
          '#00529B'
       ],
       }
     ];
     //P5
      public pieChartLabels5:string[] = ['OTD','LD'];
      public pieChartData5 = [];
      public pieChartType5:string = 'doughnut';
      public pieChartOptions5:any = [
      ];
      public colours5 = [
        {
          backgroundColor: [
            '#377B2B',
            '#7AC142',
            '#377B2B',
            '#7AC142',
            '#007CC3',
            '#00529B'
         ],
         hoverBorderColor: [
           '#377B2B',
           '#7AC142',
           '#377B2B',
           '#7AC142',
           '#007CC3',
           '#00529B'

         ],
         borderColor: [
           '#377B2B',
           '#7AC142',
           '#377B2B',
           '#7AC142',
           '#007CC3',
           '#00529B'
        ],
        }
      ];
      //P6
       public pieChartLabels6:string[] = ['OTD','LD'];
       public pieChartData6 = [];
       public pieChartType6:string = 'doughnut';
       public pieChartOptions6:any = [
       ];
       public colours6 = [
         {
           backgroundColor: [
             '#377B2B',
             '#7AC142',
             '#377B2B',
             '#7AC142',
             '#007CC3',
             '#00529B'
          ],
          hoverBorderColor: [
            '#377B2B',
            '#7AC142',
            '#377B2B',
            '#7AC142',
            '#007CC3',
            '#00529B'

          ],
          borderColor: [
            '#377B2B',
            '#7AC142',
            '#377B2B',
            '#7AC142',
            '#007CC3',
            '#00529B'
         ],
         }
       ];



  constructor(private http: HttpClient, private router: Router,private titleService: Title, private layoutChangerService : LayoutChangerService) { }


  data: any[] = [];
  readonly apiUrl = AppConfig.apiUrl()
  ngOnInit() {
    this.titleService.setTitle("Plant Wise OTD")
    this.layoutChangerService.changeHeaderPath([
    'On-Time Delivery',
    'Plant Wise OTD' ])

    this.loadOtdPlantData();
    this.loadinvPlantData();
    this.loadOtdthihariya();
    this.loadOtdKelaniya();
    this.loadOtdMawathagama();
    this.loadOtdNaula();
    this.loadOtdUhumeeya();
    this.loadOtdNarammala();
  }

  chartClicked(event){
    //console.log(this.customerArr[event.active[0]._index]);
    //console.log(event);
    //alert("s");
    //this.router.navigate(['home/taskstatussubone/'], { queryParams: { id:1} });

  }


  loadOtdPlantData(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-Otd-Plant').subscribe(response => {
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

  loadinvPlantData(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-inv-Plant').subscribe(response => {
      var data = response;

      var count = Object.keys(data['cus_data']).length;
      for (var i = 0; i < count; i++) {

        //this.pieChartLabels.push(data['cus_data'][i]['loc_name']);
        //this.pieChartData.push(data['cus_data'][i]['account_total']);
        //this.customerArr.push(data['cus_data'][i]['customer_id']);
      }
      console.log(response);
    });

  }

  loadOtdthihariya(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-otd-ld-thihariya').subscribe(response => {

      this.pieChartData1.push(response['pass']['OTD']);
      this.pieChartData1.push(response['fail']['OTD']);

      console.log(response['pass']['OTD']);
      console.log(response['fail']['OTD']);
    });
  }
  loadOtdKelaniya(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-otd-ld-kelaniya').subscribe(response => {

      this.pieChartData2.push(response['pass']['OTD']);
      this.pieChartData2.push(response['fail']['OTD']);

      console.log(response['pass']['OTD']);
      console.log(response['fail']['OTD']);
    });
  }
  loadOtdMawathagama(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-otd-ld-mawathagama').subscribe(response => {

      this.pieChartData3.push(response['pass']['OTD']);
      this.pieChartData3.push(response['fail']['OTD']);

      console.log(response['pass']['OTD']);
      console.log(response['fail']['OTD']);
    });
  }
  loadOtdNaula(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-otd-ld-naula').subscribe(response => {

      this.pieChartData4.push(response['pass']['OTD']);
      this.pieChartData4.push(response['fail']['OTD']);

      console.log(response['pass']['OTD']);
      console.log(response['fail']['OTD']);
    });
  }
  loadOtdUhumeeya(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-otd-ld-uhumeeya').subscribe(response => {

      this.pieChartData5.push(response['pass']['OTD']);
      this.pieChartData5.push(response['fail']['OTD']);

      console.log(response['pass']['OTD']);
      console.log(response['fail']['OTD']);
    });
  }
  loadOtdNarammala(){
    this.http.get(this.apiUrl + 'dashboard/dashboard?type=load-otd-ld-narammala').subscribe(response => {

      this.pieChartData6.push(response['pass']['OTD']);
      this.pieChartData6.push(response['fail']['OTD']);

      console.log(response['pass']['OTD']);
      console.log(response['fail']['OTD']);
    });
  }
}
