import { Component, OnInit } from '@angular/core';
import { startWith } from 'rxjs';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {


  numberInFocus$ = this.reportService.numberInFocus$
  duplicates$ = this.reportService.references$.pipe(
    startWith([])
  )

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
  
  }

}
