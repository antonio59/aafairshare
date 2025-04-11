// Type declarations for @google-cloud/firestore

declare module '@google-cloud/firestore' {
  export interface Settings {
    projectId?: string;
    host?: string;
    port?: number;
    ssl?: boolean;
    credentials?: any;
    timestampsInSnapshots?: boolean;
    ignoreUndefinedProperties?: boolean;
    [key: string]: any;
  }

  export class Firestore {
    settings(settings: Settings): void;
    collection(collectionPath: string): any;
    doc(documentPath: string): any;
    batch(): any;
    runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T>;
    [key: string]: any;
  }

  export class GeoPoint {
    constructor(latitude: number, longitude: number);
    latitude: number;
    longitude: number;
    isEqual(other: GeoPoint): boolean;
    [key: string]: any;
  }

  export class Timestamp {
    constructor(seconds: number, nanoseconds: number);
    seconds: number;
    nanoseconds: number;
    toDate(): Date;
    toMillis(): number;
    isEqual(other: Timestamp): boolean;
    static now(): Timestamp;
    static fromDate(date: Date): Timestamp;
    static fromMillis(milliseconds: number): Timestamp;
    [key: string]: any;
  }

  export class FieldPath {
    constructor(...fieldNames: string[]);
    isEqual(other: FieldPath): boolean;
    static documentId(): FieldPath;
    [key: string]: any;
  }

  export class FieldValue {
    isEqual(other: FieldValue): boolean;
    static serverTimestamp(): FieldValue;
    static delete(): FieldValue;
    static arrayUnion(...elements: any[]): FieldValue;
    static arrayRemove(...elements: any[]): FieldValue;
    static increment(n: number): FieldValue;
    [key: string]: any;
  }

  export interface DocumentData {
    [key: string]: any;
  }

  export interface QueryDocumentSnapshot {
    exists: boolean;
    id: string;
    createTime: Timestamp;
    updateTime: Timestamp;
    readTime: Timestamp;
    data(): DocumentData;
    get(fieldPath: string | FieldPath): any;
    ref: any;
    [key: string]: any;
  }

  export interface DocumentSnapshot extends QueryDocumentSnapshot {
    [key: string]: any;
  }

  export interface QuerySnapshot {
    docs: QueryDocumentSnapshot[];
    empty: boolean;
    size: number;
    forEach(callback: (result: QueryDocumentSnapshot) => void): void;
    [key: string]: any;
  }

  export interface CollectionReference {
    id: string;
    path: string;
    parent: any;
    doc(documentPath?: string): any;
    add(data: DocumentData): Promise<any>;
    [key: string]: any;
  }

  export interface DocumentReference {
    id: string;
    path: string;
    parent: CollectionReference;
    collection(collectionPath: string): CollectionReference;
    isEqual(other: DocumentReference): boolean;
    get(): Promise<DocumentSnapshot>;
    set(data: DocumentData, options?: any): Promise<any>;
    update(data: DocumentData): Promise<any>;
    update(field: string | FieldPath, value: any, ...moreFieldsAndValues: any[]): Promise<any>;
    delete(): Promise<any>;
    [key: string]: any;
  }

  export interface Query {
    where(fieldPath: string | FieldPath, opStr: string, value: any): Query;
    orderBy(fieldPath: string | FieldPath, directionStr?: string): Query;
    limit(limit: number): Query;
    limitToLast(limit: number): Query;
    offset(offset: number): Query;
    startAt(snapshot: DocumentSnapshot): Query;
    startAt(...fieldValues: any[]): Query;
    startAfter(snapshot: DocumentSnapshot): Query;
    startAfter(...fieldValues: any[]): Query;
    endBefore(snapshot: DocumentSnapshot): Query;
    endBefore(...fieldValues: any[]): Query;
    endAt(snapshot: DocumentSnapshot): Query;
    endAt(...fieldValues: any[]): Query;
    get(): Promise<QuerySnapshot>;
    stream(): any;
    onSnapshot(observer: any): () => void;
    onSnapshot(options: any, observer: any): () => void;
    onSnapshot(
      onNext: (snapshot: QuerySnapshot) => void,
      onError?: (error: Error) => void,
      onCompletion?: () => void
    ): () => void;
    onSnapshot(
      options: any,
      onNext: (snapshot: QuerySnapshot) => void,
      onError?: (error: Error) => void,
      onCompletion?: () => void
    ): () => void;
    [key: string]: any;
  }

  // Add other Firestore types as needed
  export namespace v1 {
    // Namespace for v1 API
    interface FirestoreV1 {
      [key: string]: any;
    }
  }

  export function setLogFunction(logger: (msg: string) => void): void;
}