import { Component, OnInit } from '@angular/core';
import { animationFrameScheduler, BehaviorSubject, catchError, defer, exhaustMap, fromEvent, interval, map, of, skip, startWith, Subject, takeUntil, takeWhile, tap } from 'rxjs';
import { ReportService } from 'src/app/services/report.service';


type cord = {
  x: number,
  y: number
}

type fields = 'reference' | 'startBalance' | 'mutation' | 'endBalance'

export type Interesting = {
  reference: { type: fields, value: string, position: cord },
  startBalance: { type: fields, value: string, position: cord },
  mutation: { type: fields, value: string, position: cord },
  endBalance: { type: fields, value: string, position: cord },
}

@Component({
  selector: 'app-auditor',
  templateUrl: './auditor.component.html',
  styleUrls: ['./auditor.component.scss']
})
export class AuditorComponent implements OnInit {


  areasOfInterest$ = new BehaviorSubject<Interesting[]>([])


  constructor(private reportService: ReportService) { }

  case$ = new BehaviorSubject<[number, 0 | 1 | 2 | 3]>([0, 0])
  nextCase(){
    if(!(this.case$.value[0] === this.areasOfInterest$.value.length)) {
      if(this.case$.value[1] === 3){
        this.case$.next([this.case$.value[0] +1, 0])
      } else {
        this.case$.next([this.case$.value[0], this.case$.value[1] + 1 as 0 | 1 | 2 | 3])
      }
    }
  }

  allCases() {
    interval(700).pipe(
      takeWhile(e => e < this.areasOfInterest$.value.length * 4 - 1),
    ).subscribe(() =>
      this.nextCase()
    )
  }

  position$ = defer(() => {
    return this.case$.asObservable().pipe(
    exhaustMap((nextLocation) => {
      const startTime = Date.now();
      return interval(0, animationFrameScheduler).pipe(
        map(() => Date.now() - startTime),
        map((t) => t / 435),
        map((x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)),
        takeWhile((t) => t < 1),
        map((t) => {
          
          let originX = document.getElementById("auditor")?.getBoundingClientRect().x || 0
          let originY = document.getElementById("auditor")?.getBoundingClientRect().y || 0
 
          const entryInFocus = this.areasOfInterest$.value[nextLocation[0]][numberToLocationMapper(nextLocation[1])]
          
          this.reportService.handler(entryInFocus)  
          
          const x = entryInFocus.position.x + 2
          const y = this.areasOfInterest$?.value[nextLocation[0] || 0][numberToLocationMapper(nextLocation[1])]
          .position.y + 32 || 0
        

         return { 
          x: -t * (originX - x) + originX,
          y: -t * (originY - y) + originY
        }
        }
        
      ))}),
    map(({x, y}) => ({x, y})),
    catchError(() => of({x: 0, y: 0})),
    startWith({x: 0, y: 0}),
  )})

  ngOnInit(): void {
    const rec = document.querySelectorAll("[record]")
    
    rec.forEach((record) => {

      const {innerText: refText} = record.querySelectorAll('td')[0]
      const {x: refX, y: refY } = record.querySelectorAll('td')[0].getBoundingClientRect()

      const {innerText: balVal} = record.querySelectorAll('td')[3]
      const {x: balX, y: balY } = record.querySelectorAll('td')[3].getBoundingClientRect()

      const {innerText: mutValAndKind} = record.querySelectorAll('td')[4]
      const {x: mutX, y: mutY } = record.querySelectorAll('td')[4].getBoundingClientRect()

      const {innerText: totalVal} = record.querySelectorAll('td')[5]
      const {x: totalX, y: totalY } = record.querySelectorAll('td')[5].getBoundingClientRect()


      this.areasOfInterest$.next([...this.areasOfInterest$.value,
        {
          reference : {type: 'reference', value: refText, position : { x: refX, y: refY }},
          startBalance : {type: 'startBalance', value: balVal, position : { x: balX, y: balY }},
          mutation: {type: 'mutation', value: mutValAndKind, position : { x: mutX, y: mutY }},
          endBalance: {type: 'endBalance', value: totalVal, position : { x: totalX, y: totalY }},
        }
      ])
    })
  }

}


const numberToLocationMapper = (number: 0 | 1 | 2 |3) => {
  switch (number) {
    case 0:
      return 'reference'
    case 1:
      return 'startBalance'
    case 2:
      return 'mutation'
    case 3:
      return 'endBalance'
  }
}

const originDetermined = (textual : 'reference' | 'startBalance' | 'mutation' | 'endBalance') => {
  switch (textual) {
    case 'reference':
      return false
    case 'startBalance':
      return 'reference'
    case 'mutation':
      return 'startBalance'
    case 'endBalance':
      return 'mutation'
  }
}