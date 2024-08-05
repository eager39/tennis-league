import pdf from "pdf-parse"


export async function pdfparse(path) {
   return await pdf(path);

  }