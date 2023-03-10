import { Injectable } from '@angular/core';
import { distinctUntilChanged, map, scan, Subject } from 'rxjs';
import { Interesting } from '../components/auditor/auditor.component';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor() { }

  references$$ = new Subject<{ref : string, date: number}>()
  public references$ = this.references$$.pipe(
    distinctUntilChanged((p, c) => {
      return c.date - p.date < 1000
    }),
    scan((p: string[], c) => {
      return [...p, c.ref]
    }, []),
    map(l => l.filter((e, i, a) => a.indexOf(e) !== i)),
  )


  public numberInFocus$$ = new Subject<Interesting['endBalance']>()
  public numberInFocus$ = this.numberInFocus$$.pipe(
    distinctUntilChanged((p, c) => p.type === c.type),
    scan((p, c) => {
      switch (c.type) {
        case 'startBalance':
          return {
            correct : true,
            amount: c.value,
          }
        case 'mutation':
          if(c.value.includes('-')){
            return {
              correct : true,
              amount: `${p.amount} - ${parseFloat(c.value.replace('-', ''))}`,
            }
          } else {
            return {
              correct : true,
              amount: `${p.amount} + ${parseFloat(c.value.replace('+', ''))}`
            }
          }
        case 'endBalance':
          if(p.amount.includes('-')){
            const splitted = p.amount.split('-')
            const answer = Math.round((parseFloat(splitted[0]) - parseFloat(splitted[1]) + Number.EPSILON) * 100) / 100
            return {
              amount: `${splitted[0]}- ${splitted[1]} = ${answer}`,
              correct: `${answer}` === c.value
            }
          } else if(p.amount.includes('+')) {
            const splitted = p.amount.split('+')
            const answer = Math.round((parseFloat(splitted[0]) + parseFloat(splitted[1]) + Number.EPSILON) * 100) / 100
            return  { 
              amount: `${splitted[0]}+ ${splitted[1]} = ${Math.round((parseFloat(splitted[0]) + parseFloat(splitted[1]) + Number.EPSILON) * 100) / 100}`, 
              correct : `${answer}` === c.value,
            }
          }
      }
      return {correct : true, amount: '0'}
    }, {correct : true, amount : '0'})
  )

  handler(caseToDealWith: Interesting['endBalance']){
    switch (caseToDealWith.type) {
      case 'reference':
        this.references$$.next({date : Date.now(), ref : caseToDealWith.value})
        break;
      case 'startBalance':
        this.numberInFocus$$.next(caseToDealWith)
        break;
      case 'mutation':
        this.numberInFocus$$.next(caseToDealWith)
        break;
      case 'endBalance':
        this.numberInFocus$$.next(caseToDealWith)
        break;  
    
      default:
        break;
    }
  }

}
