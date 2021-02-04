import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TrimInspectionService } from '../trim-inspection.service';
import { TabsetComponent,TabDirective } from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { TrimInspectionComponent } from '../trim-inspection.component';
import { TrimInspectionDetailsComponent } from '../trim-inspection-details/trim-inspection-details.component';

@Component({
  selector: 'app-trim-inspection-home',
  templateUrl: './trim-inspection-home.component.html',
  styleUrls: ['./trim-inspection-home.component.css']
})
export class TrimInspectionHomeComponent implements OnInit {
  @ViewChild('buyerPoTabs') tabs: TabsetComponent;
  @ViewChild(TrimInspectionDetailsComponent) childInspectionDetails: TrimInspectionDetailsComponent;
  @ViewChild(TrimInspectionComponent) childInscpection:TrimInspectionComponent;

  constructor(private router: ActivatedRoute,private inspectionService : TrimInspectionService, private titleService: Title) { }

    ngOnInit() {

      this.titleService.setTitle("SMV")//set page title

      this.inspectionService.triminspectionData
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
        case 'Trim Inspection List' :
              if(this.childInspectionDetails.datatable == null){
              }
              //debugger
            this.childInspectionDetails.reloadTable()

          break;
        case 'Trim Inspection' :

           this.childInscpection.clear();
          break;


      }



    }
}
