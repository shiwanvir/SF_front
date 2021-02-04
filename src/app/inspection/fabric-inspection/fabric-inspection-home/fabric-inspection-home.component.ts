import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { InspectionService } from '../inspection.service';
import { TabsetComponent,TabDirective } from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { FabricInspectionComponent } from '../fabric-inspection.component';
import { FabricInspectionDetailsComponent } from '../fabric-inspection-details/fabric-inspection-details.component';


@Component({
  selector: 'app-fabric-inspection-home',
  templateUrl: './fabric-inspection-home.component.html',
  styleUrls: ['./fabric-inspection-home.component.css']
})
export class FabricInspectionHomeComponent implements OnInit {
  @ViewChild('buyerPoTabs') tabs: TabsetComponent;
  @ViewChild(FabricInspectionDetailsComponent) childInspectionDetails: FabricInspectionDetailsComponent;
  @ViewChild(FabricInspectionComponent) childInscpection: FabricInspectionComponent;

  constructor(private router: ActivatedRoute,private inspectionService : InspectionService, private titleService: Title) { }


  ngOnInit() {

    this.titleService.setTitle("SMV")//set page title

    this.inspectionService.inspectionData
     .subscribe(data => {
     if(data != null){
         this.tabs.tabs[1].active = true;
       }
     })
  }

  onSelect(data: TabDirective): void {

    let pathArr = [
      'Catalogue',
      'IE'
    ];

    switch(data.heading){
      case 'Fabric Inspection List' :
            if(this.childInspectionDetails.datatable == null){
            }
            //debugger
          this.childInspectionDetails.reloadTable()

        break;
      case 'Fabric Inspection' :

         this.childInscpection.clear();
        break;


    }



  }

}
