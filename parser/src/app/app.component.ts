import { Component, OnInit } from '@angular/core';
import { combineLatest, delay, exhaustMap, fromEvent, interval, map, merge, startWith, switchMap, take, tap, timer } from 'rxjs';
import { StatementsService } from './services/statements.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  data$ = combineLatest([this.statementsService.getCsvStatement(), this.statementsService.getXmlStatement()]).pipe(
    map((el) => [...el[0], ...el[1]]),
  )

  userChangedScreen$ = fromEvent(window, 'resize').pipe(
    switchMap((x) => interval(10).pipe(
      take(2),
      map((x) => x === 0 ? false : true))),
    startWith(true)
  )

  loaded$ = this.data$.pipe(
    delay(0),
    startWith(false)
  )

  constructor(private statementsService: StatementsService){

  }

}
