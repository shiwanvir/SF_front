import { Component, OnInit , ViewChild , AfterViewInit} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';

import { SourceComponent } from './source.component';
import { ClusterComponent } from './cluster.component';
import { CompanyComponent } from './company.component';
import { CompanyLocationComponent } from './company-location.component';

import { PermissionsService } from '../../core/service/permissions.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: []
})
export class LocationComponent implements OnInit {

  @ViewChild('locationTabs') locationTabs: TabsetComponent;
  @ViewChild(SourceComponent) childSource: SourceComponent;
  @ViewChild(ClusterComponent) childCluster: ClusterComponent;
  @ViewChild(CompanyComponent) childCompany: CompanyComponent;
  @ViewChild(CompanyLocationComponent) childLocation: CompanyLocationComponent;

  component_name='';

  constructor(private router: ActivatedRoute, private permissionService:PermissionsService,
    private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  ngOnInit() {
    this.router.data
    .subscribe(res => {
        let pathArr = [
          'Catalogue',
          'Application Basic Setup'
        ];

        if(res.tabName == 'SOURCE'){
          this.locationTabs.tabs[0].active = true;
            this.component_name="Parent Company"
          //  if(this.permissionService.hasDefined('SOURCE_MANAGE')){//check permission
              this.childSource.createTable()
          //  }
        }
        else if(res.tabName == 'CLUSTER'){
          this.locationTabs.tabs[1].active = true;
            this.component_name="Cluster"
          //  if(this.permissionService.hasDefined('CLUSTER_MANAGE')){//check permission
              this.childCluster.createTable()
          //  }
        }
        else if(res.tabName == 'COMPANY'){
          this.locationTabs.tabs[2].active = true;
            this.component_name="Company"
          //  if(this.permissionService.hasDefined('COMPANY_MANAGE')){//check permission
              this.childCompany.createTable()
          //  }
        }
        else if(res.tabName == 'LOCATION'){
          this.locationTabs.tabs[3].active = true;
            this.component_name="Location"
          //  if(this.permissionService.hasDefined('LOC_MANAGE')){//check permission
              this.childLocation.createTable()
          //  }
        }

        this.titleService.setTitle(this.component_name)
        pathArr.push(this.component_name);
        //change header nevigation pagePath
        this.layoutChangerService.changeHeaderPath(pathArr)
    });
  }


  ngAfterViewInit(){

  }

  onSelect(data: TabDirective): void {

    let pathArr = [
      'Catalogue',
      'Application Basic Setup'
    ];

    switch(data.heading){
      case 'Parent Company' :
        this.component_name="Parent Company"
        //if(this.permissionService.hasDefined('SOURCE_MANAGE')){//check permission
          if(this.childSource.datatable == null){
              this.childSource.createTable()
          }
          this.childSource.reloadTable()
        //}
        break;
      case 'Cluster' :
        this.component_name="Cluster"
        //if(this.permissionService.hasDefined('CLUSTER_MANAGE')){//check permission
          if(this.childCluster.datatable == null){
              this.childCluster.createTable()
          }
          this.childCluster.reloadTable()
        //}
        break;
      case 'Company' :
        this.component_name="Company"
        //if(this.permissionService.hasDefined('COMPANY_MANAGE')){//check permission
          if(this.childCompany.datatable == null){
              this.childCompany.createTable()
          }
      //  }
        break;
      case 'Location' :
        this.component_name="Location"
        //if(this.permissionService.hasDefined('LOC_MANAGE')){//check permission
          if(this.childLocation.datatable == null){
              this.childLocation.createTable()
          }
        //}
        break;
    }

    this.titleService.setTitle(this.component_name)
    pathArr.push(this.component_name);
    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath(pathArr)

  }

}
