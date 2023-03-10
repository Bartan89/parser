import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { xml2json } from 'xml-js';

@Injectable({
  providedIn: 'root'
})
export class StatementsService {
  
  constructor(private http: HttpClient) { }

  getXmlStatement(){
    return this.http.get('/assets/records.xml', {responseType : 'text'}).pipe(
      map(xml => xml2json(xml, {compact: true, spaces: 4})),
      map(json => JSON.parse(json)),
      map(({records}) => {
        const breakDown = records.record.reduce((prev: any, cur: any, i: number) => {
         
          const reference = cur._attributes.reference
          const accountNumber = cur.accountNumber._text
          const description = cur.description._text
          const startBalance = cur.startBalance._text
          const mutation = cur.mutation._text
          const endBalance = cur.endBalance._text

          return [...prev, {reference , accountNumber, description, startBalance, mutation, endBalance}]
        }, [])


        return breakDown
      })
    )
  }

  getCsvStatement(){
    const headers = new HttpHeaders({'Content-Type':'text; charset=UTF-8'});
    return this.http.get('/assets/records.csv', {responseType : 'text', headers}).pipe(
      map(csv => csv.split(/\r?\n/).reduce((prev : any, cur: any, i: any) => {

        if(!i) return prev
        
        const breakDown = cur.split(',')
        
        const reference = breakDown[0]
        const accountNumber = breakDown[1]
        const description = breakDown[2]
        const startBalance = breakDown[3]
        const mutation = breakDown[4]
        const endBalance = breakDown[5]
        
        if(!reference) return prev

        return [...prev, {reference , accountNumber, description, startBalance, mutation, endBalance}]
    }, []))
    )
  }

}
