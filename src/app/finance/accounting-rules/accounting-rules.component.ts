import { Component, OnInit , ViewChild , AfterViewInit  } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';

import {PaymentTermComponent} from "../payment-term/payment-term.component";
import {CostCenterComponent}  from"../cost-center/cost-center.component";
import {PaymentMethodComponent} from "../payment-method/payment-method.component";

import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { PermissionsService } from '../../core/service/permissions.service';


@Component({
  selector: 'app-accounting-rules',
  templateUrl: './accounting-rules.component.html',
  styleUrls: ['./accounting-rules.component.css']
})
export class AccountingRulesComponent implements OnInit {

  @ViewChild('financeTabs') financeTabs: TabsetComponent;
  @ViewChild(PaymentTermComponent) childPaymentTerm: PaymentTermComponent;
  @ViewChild(CostCenterComponent) childCostCenter: CostCenterComponent;
  @ViewChild(PaymentMethodComponent) childPaymentMethod: PaymentMethodComponent;

    component_name='';
    pageHeader:string = '';
    linkPath:string='';
    constructor(private router: ActivatedRoute, private permissionService : PermissionsService, private titleService: Title,private layoutChangerService : LayoutChangerService) {
    }


    ngOnInit() {
      this.router.data
      .subscribe(res => {
        let pathArr = [
          'Catalogue',
          'Finance'
        ];
    //  debugger
          if(res.tabName == 'PAYMENTTERM'){
            this.component_name="Payment Term"
            this.financeTabs.tabs[0].active = true;
            this.pageHeader = 'Payment Term';
            this.linkPath = 'http://localhost:4200/#/finance/payment-term';
            this.titleService.setTitle("Payment Term")//set page title
            pathArr.push('Payment Term')

            if(this.permissionService.hasDefined('PAYMENT_TERM_MANAGE')){//check permission
              this.childPaymentTerm.createTable()
            }

          }
          else if(res.tabName == 'COSTCENTER'){
            this.component_name="Cost Center"
            this.financeTabs.tabs[1].active = true;
            this.pageHeader = 'Cost Center';
            this.linkPath = 'http://localhost:4200/#/finance/cost-center';
            this.titleService.setTitle("Cost Center")//set page title
            pathArr.push('Cost Center')

            if(this.permissionService.hasDefined('COST_CENTER_MANAGE')){//check permission
              this.childCostCenter.createTable()
            }

          }
          else if(res.tabName == 'PAYMENTMETHOD'){
            this.component_name="Payment Method"
            this.financeTabs.tabs[2].active = true;
            this.pageHeader = 'Payment Method';
            this.linkPath = 'http://localhost:4200/#/finance/payment-method';
            this.titleService.setTitle("Payment Method")//set page title
            pathArr.push('Payment Method')

            if(this.permissionService.hasDefined('PAYMENT_METHOD_MANAGE')){//check permission
              this.childPaymentMethod.createTable()
            }

          }

          //this.titleService.setTitle(this.component_name)
          //pathArr.push(this.component_name);
          //change header nevigation pagePath
          this.layoutChangerService.changeHeaderPath(pathArr)

      });
    }


    onSelect(data: TabDirective): void {
      let pathArr = [
        'Catalogue',
        'Finance'
      ];
    //  debugger
      switch(data.heading){
        case 'Payment Term' :
         this.component_name='Payment Term'
          this.titleService.setTitle("Payment Term")//set page title
          pathArr.push('Payment Term')
          this.pageHeader = 'Payment Term';
          this.linkPath = 'http://localhost:4200/#/finance/payment-term';

          if(this.childPaymentTerm.datatable == null){
            if(this.permissionService.hasDefined('PAYMENT_TERM_MANAGE')){//check permission
              this.childPaymentTerm.createTable()

            }
          }
          break;
        case 'Cost Center' :
           this.component_name='Cost Center'
          this.titleService.setTitle("Cost Center")//set page title
          pathArr.push('Cost Center')
          this.pageHeader = 'Cost Center';
          this.linkPath = 'http://localhost:4200/#/finance/cost-center';

            if(this.childCostCenter.datatable == null){
            if(this.permissionService.hasDefined('COST_CENTER_MANAGE')){//check permission
              this.childCostCenter.createTable()


            }
          }
          break;
        case 'Payment Method' :
         this.component_name='Payment Method'
          this.titleService.setTitle("Payment Method")//set page title
          pathArr.push('Payment Method')
          this.pageHeader = 'Payment Method';
          this.linkPath = 'http://localhost:4200/#/finance/payment-method';
          
            if(this.childPaymentMethod.datatable == null){
            if(this.permissionService.hasDefined('PAYMENT_METHOD_MANAGE')){//check permission
              this.childPaymentMethod.createTable()

            }
          }
          break;

      }

      //this.titleService.setTitle(this.component_name)
      //pathArr.push(this.component_name);
      //change header nevigation pagePath
      this.layoutChangerService.changeHeaderPath(pathArr)
    }

}
