declare module '*.worker.ts' {
  class WebWorker extends Worker {
    constructor();
  }
  export default WebWorker;
}

declare module '*?worker' {
  const worker: Worker;
  export default worker;
}

declare module '*?worker&inline' {
  const worker: Worker;
  export default worker;
}