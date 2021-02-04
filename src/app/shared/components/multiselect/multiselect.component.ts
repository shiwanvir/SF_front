import { Component, OnInit , Input , Output ,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-multiselect',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.css']
})
export class MultiselectComponent implements OnInit {

  @Input('notSelected') data1 : Array<any> = []
  @Input('selected') data2 : Array<any> = []
  @Input('notSelectedHeader') notSelectedHeader:string = 'Not Selected'
  @Input('selectedHeader') selectedHeader:string = 'Selected'
  @Input('bindLabel') bindLabel = 'text'
  @Input('bindId') bindId = 'id'

  @Output('onSave') saveEvent = new EventEmitter()

  constructor() { }

  ngOnInit() {

  }

  moveForward(e){

    for(let x = 0 ; x < e.target.selectedOptions.length ; x++) {
      let option = e.target.selectedOptions[x]
      /*this.data2.push({
        division_id : option.value,
        division_description : option.text
      })*/
    //  this.data2[this.data2.length]['division_id'] = option.value
    //  this.data2[this.data2.length]['division_description'] = option.text
      //alert(option.attributes['data-index'].value)
     this.data2.push(this.data1[option.attributes['data-index'].value])
      this.data1.splice(option.attributes['data-index'].value,1);
    }
  }

  moveBackward(e){
  //  console.log(e)
  //  console.log(e.target.selectedOptions)

    for(let x = 0 ; x < e.target.selectedOptions.length ; x++) {
      let option = e.target.selectedOptions[x]
      /*this.data1.push({
        division_id : option.value,
        division_description : option.text
      })*/
      this.data1.push(this.data2[option.attributes['data-index'].value])
      this.data2.splice(option.attributes['data-index'].value,1);
    }
  }

  saveList(){
    this.saveEvent.emit(this.data2)
  }

}
