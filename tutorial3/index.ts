
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio"
import { createRetrievalChain } from "langchain/chains/retrieval";

import {
  DistanceStrategy,
  PGVectorStore,
  PGVectorStoreArgs,
} from "@langchain/community/vectorstores/pgvector";
import { PoolConfig } from "pg";
import { EnvironmentData } from "./EnvironmentData";

const readlineSync = require('readline-sync');

function getEnvironmentVariables() {
  let response = new EnvironmentData();
  response.DbHost = process.env.DbHost;
  response.UserName = process.env.UserName;
  response.DbPassword = process.env.DbPassword;
  response.DbName = process.env.DbName;
  response.DbPort = parseInt(process.env.DbPort + "");

  return response;
}

let envData = getEnvironmentVariables();
console.log(envData);

const config: PGVectorStoreArgs = {
  postgresConnectionOptions: {
    type: "postgres",
    host: envData.DbHost,
    port: envData.DbPort,
    user: envData.UserName,
    password: envData.DbPassword,
    database: envData.DbName,
  } as PoolConfig,
  tableName: "content1",
  columns: {
    idColumnName: "id",
    vectorColumnName: "vector",
    contentColumnName: "content",
    metadataColumnName: "metadata",
  },
  // supported distance strategies: cosine (default), innerProduct, or euclidean
  distanceStrategy: "cosine" as DistanceStrategy,
};



async function main() {
  console.log("start main...")
 
  console.log("start create embeddings");
  let embeddings = new OpenAIEmbeddings();
  console.log("end create embeddings");

  const pgvectorStore = await PGVectorStore.initialize(embeddings,config);

  console.log("pgvectorStore started...")

  await pgvectorStore.addDocuments([
    { pageContent: "what's this", metadata: { a: 2 } },
    { pageContent: "Cat drinks milk", metadata: { a: 1 } },
  ]);

  console.log("documents added")

  const splitter = new RecursiveCharacterTextSplitter();

  const prompt =
    ChatPromptTemplate.fromTemplate(`Answer the following question based only on the provided context:
  <context>
  {context}
  </context>

  Question: {input}`);

  const model = new ChatOpenAI({});

  const documentChain = await createStuffDocumentsChain({
    llm: model,
    prompt,
  });

  const retriever = pgvectorStore.asRetriever();

  const retrievalChain = await createRetrievalChain({
    combineDocsChain: documentChain,
    retriever,
  });

  while(true)
  {
    let question = readlineSync.question(">");

    const result = await retrievalChain.invoke({
      input: question
    });

    console.log(result.answer); 
    console.log("==================================================") 
  }
}

main();
