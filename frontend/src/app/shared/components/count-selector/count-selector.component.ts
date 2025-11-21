import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'count-selector',
  templateUrl: './count-selector.component.html',
  styleUrls: ['./count-selector.component.scss']
})
export class CountSelectorComponent implements OnInit {

  // принимать из родителя
  @Input() count: number = 1;

  // прослушиватель изменений
  @Output() onCountChange: EventEmitter<number> = new EventEmitter<number>();

  constructor() {
  }

  ngOnInit(): void {
  }

  // изменяем
  countChange() {
    this.onCountChange.emit(this.count);
  }

  decreaseCount() {
    if (this.count > 1) {
      this.count--;
      // отправляем изменения в родительский
      this.countChange();
    }
  }

  increaseCount() {
    this.count++;
    // отправляем изменения в родительский
    this.countChange();
  }

}
