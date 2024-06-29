
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio"
import { createRetrievalChain } from "langchain/chains/retrieval";
const readlineSync = require('readline-sync');

async function main() {
  // const loader = new CheerioWebBaseLoader(
  //   "https://www.vatican.va/content/john-paul-ii/en/letters/1994/documents/hf_jp-ii_let_02021994_families.html"
  // );

  // const docs = await loader.load();

  // const splitter = new RecursiveCharacterTextSplitter();

  // const splitDocs = await splitter.splitDocuments(docs);

  // const embeddings = new OpenAIEmbeddings();

  // const vectorstore = await MemoryVectorStore.fromDocuments(
  //   splitDocs,
  //   embeddings
  // );


  // const prompt =
  //   ChatPromptTemplate.fromTemplate(`Answer the following question based only on the provided context:
  
  // <context>
  // {context}
  // </context>
  
  // Question: {input}`);

  // const model = new ChatOpenAI({});

  // const documentChain = await createStuffDocumentsChain({
  //   llm: model,
  //   prompt,
  // });

  // const retriever = vectorstore.asRetriever();

  // const retrievalChain = await createRetrievalChain({
  //   combineDocsChain: documentChain,
  //   retriever,
  // });

  // while(true)
  // {
  //   let question = readlineSync.question(">");

  //   const result = await retrievalChain.invoke({
  //     input: question
  //   });
    
  //   console.log(result.answer); 
  //   console.log("==================================================") 
  // }
}

main();
