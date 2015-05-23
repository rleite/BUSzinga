import {Component, View, bootstrap} from 'angular2/angular2';
import {Display} from 'display';

// Annotation section
@Component({
  selector: 'my-app'
})
@View({
  directives: [Display],
  template: '<display></display>'
})
// Component controller
class MyAppComponent {}

bootstrap(MyAppComponent);