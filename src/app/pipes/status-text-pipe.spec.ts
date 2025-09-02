import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusText',
  standalone: true
})
export class StatusTextPipe implements PipeTransform {
  transform(value: number): string {
    switch (value) {
      case 0: return 'ACTIVE';
      case 1: return 'REQUESTED';
      case 2: return 'INCOMPLETE';
      case 3: return 'ACCEPTED';
      case 4: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}
