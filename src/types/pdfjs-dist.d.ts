declare module "pdfjs-dist/legacy/build/pdf" {
  export const version: string;
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export function getDocument(params: any): {
    promise: Promise<any>;
  };
}
