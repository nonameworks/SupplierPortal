import { FirestoreService } from './services/firestore.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Site } from './model/site.model';
import { Detail } from './model/detail.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'supplier-portal';
  sites: Site[];
  selectedSite: Site;
  unprocessedDetails: any[] = [];
  processingDetails: any[] = [];
  unprocessed: () => void;
  processing: () => void;

  constructor(private firestore: FirestoreService) { }

  ngOnInit() {
    this.firestore.getSites().then(value => {
      this.sites = value.docs.map(doc => doc.data());
    });
  }

  getDetails() {
    this.getUnprocessedData();
    this.getProcessingData();
  }

  private getUnprocessedData() {
    this.unprocessedDetails = [];
    if (this.unprocessed) { this.unprocessed(); }
    this.unprocessed =  this.firestore.getDetails(this.selectedSite.Name, 'Unprocessed').onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(change => {
        switch (change.type) {
          case 'added':
            this.unprocessedDetails.push(Object.assign(change.doc.data(), { id: change.doc.id }));
            break;
          case 'modified':
            this.updateDetail(this.unprocessedDetails, change.doc.data(), change.doc.id);
            break;
          case 'removed':
            this.unprocessedDetails = this.unprocessedDetails.filter(x => x.id !== change.doc.id);
        }
      });
    });
  }

  private getProcessingData() {
    this.processingDetails = [];
    if (this.processing) { this.processing(); }
    this.processing = this.firestore.getDetails(this.selectedSite.Name, 'Processing').onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(change => {
        switch (change.type) {
          case 'added':
            this.processingDetails.push(Object.assign(change.doc.data(), { id: change.doc.id }));
            break;
          case 'modified':
            this.updateDetail(this.processingDetails, change.doc.data(), change.doc.id);
            break;
          case 'removed':
            this.processingDetails = this.processingDetails.filter(x => x.id !== change.doc.id);
        }
      });
    });
  }

  private updateDetail(details: any, newDetail: any, id: string) {
    const match = details.find(x => x.id === id);
    Object.assign(match, newDetail);
  }

  detailChanged(detail: Detail) {
    this.firestore.updateDetail(detail.id, detail);
  }

  doSomething(detail: Detail) {
    let props = {};
    switch (detail.State) {
      case 'Unprocessed': props = { State: 'Processing'}; break;
      case 'Processing': props = { State: 'Unprocessed'}; break;
    }
    this.firestore.updateDetail(detail.id, props);
  }
}
