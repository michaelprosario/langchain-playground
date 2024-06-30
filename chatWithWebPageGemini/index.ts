
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatPromptTemplate, HumanMessagePromptTemplate, PromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio"
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TaskType } from "@google/generative-ai";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

const readlineSync = require('readline-sync');

async function main() {
  
  const loader = new CheerioWebBaseLoader("https://en.wikipedia.org/wiki/History_of_Google");

  const doc = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter();

  const splitDocs = await splitter.splitDocuments(doc);

  const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "embedding-001"
  });

  const vectorstore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );




  // Create the retrieval chain
  let template = `
  You are a helpful AI assistant.
  Answer based on the context provided. 
  context: {context}
  input: {input}
  answer:
  `
  let prompt = PromptTemplate.fromTemplate(template)

  const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-pro",
    maxOutputTokens: 2048,
  });

  const documentChain = await createStuffDocumentsChain({
    llm: model,
    prompt,
  });

  const retriever = vectorstore.asRetriever();

  const retrievalChain = await createRetrievalChain({
    combineDocsChain: documentChain,
    retriever,
  });

  while (true) {
    let input = readlineSync.question(">");

    let chainResponse = await retrievalChain.invoke({ input: input });
    /*
    const chain = RunnableSequence.from([
      {
        context: retrievalChain,
        question: new RunnablePassthrough(),
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);
    const answer = await chain.invoke(input);
    */

    console.log(chainResponse.answer);
    console.log("==================================================")
    //console.log(chainResponse);
    //console.log("==================================================")
  }
}

main();
