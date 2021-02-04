import { Directive, HostListener, ElementRef,Renderer } from '@angular/core';

@Directive({
  selector: '[upperCase]'
})
export class UpperCaseDirective {

  constructor( private renderer: Renderer,private el: ElementRef) {  }

  @HostListener('keyup') onKeyUp() {
    // this.el.nativeElement.value = this.el.nativeElement.value.toUpperCase();
    // console.log(this.el.nativeElement.value)
   }

}
