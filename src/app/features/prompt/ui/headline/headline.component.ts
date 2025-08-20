import { Component } from '@angular/core';

@Component({
  selector: 'app-headline',
  standalone: true,
  imports: [],
  templateUrl: './headline.component.html',
  styleUrl: './headline.component.css',
  host: {
    class: 'contents'
  }
})
export class HeadlineComponent {

}
