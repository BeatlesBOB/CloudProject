import { Pipe, PipeTransform } from '@angular/core';
import { element } from 'protractor';

@Pipe({
  name: 'classement'
})
export class ClassementPipe implements PipeTransform {

  transform(array: [], field: string) {
    return array.sort()
  }
}


