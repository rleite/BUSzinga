/// <reference path="../typings/angular2/angular2.d.ts" >
import {Component, View} from 'angular2/angular2';

console.log('->Display');

// Annotation section
@Component({
  selector: 'display'
})
@View({
   template: '<h1>{{say}}</h1>'
})
export class Display {
  say: string;
  constructor() {
    console.log('->Display Constructor');
    this.say = 'Hello World!';
  }
}