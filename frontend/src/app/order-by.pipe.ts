import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})



export class OrderByPipe implements PipeTransform {
  transform(array: any[], field: string, order: string): any[] {
    if (!Array.isArray(array)) {
      return array;
    }

    // Sorting logic based on the field (e.g., 'createdAt')
    array.sort((a: any, b: any) => {
      const aValue = a[field];
      const bValue = b[field];

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });

    return array;
  }
}
