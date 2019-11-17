import { Injectable } from '@angular/core';

import * as firebase from 'firebase/app';
import 'firebase/firestore';

import { environment } from 'src/environments/environment';
import { Detail } from '../model/detail.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  database: firebase.firestore.Firestore;

  constructor() {
    firebase.initializeApp(environment.firebase);
    this.database = firebase.firestore();
   }

   getSites(): Promise<any> {
     return this.database.collection('Sites').get();
   }

   getDetails(site: string, state: string): firebase.firestore.Query {
    return this.database.collection('Details').where('Site', '==', site).where('State', '==', state);
   }

  addDetail(detail: Detail): Promise<any> {
    return this.database.collection('Details').add(detail);
  }

  updateDetail(id: string, newProps: object): Promise<any> {
    return this.database.collection('Details').doc(id).update(newProps);
  }
}
