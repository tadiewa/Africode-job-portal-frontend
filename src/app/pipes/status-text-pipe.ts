import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusText'
})
export class StatusTextPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
