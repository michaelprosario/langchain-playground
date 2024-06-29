
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
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

  const pgvectorStore = await PGVectorStore.initialize(embeddings, config);

  console.log("pgvectorStore started...")

  let dataSet = [
    { "fact": "Wolverine's real name is James Howlett, but has gone by many aliases including Logan." },
    { "fact": "Spider-Man's webbing is not actually made from a spider. It's a self-designed synthetic compound." },
    { "fact": "Iron Man's first appearance was not in a comic book, but in Tales of Suspense #39 (1963) which was a science fiction anthology magazine." },
    { "fact": "Thor's hammer, Mjolnir, can only be wielded by those deemed worthy." },
    { "fact": "Captain America was originally not going to be called Captain America, but 'Super Soldier'." },
    { "fact": "The Hulk's green color scheme was originally chosen because it was the only color ink available at the time that wouldn't obscure the detailed penciled art." },
    { "fact": "Black Widow was originally introduced as a villain working for the KGB against Iron Man." },
    { "fact": "Storm can control the weather by manipulating moisture, temperature, and air pressure." },
    { "fact": "Wolverine has three adamantium claws on each hand, but they weren't introduced until his 1974 appearance in Giant-Size X-Men #1." },
    { "fact": "Professor X can telepathically communicate with and read the minds of others." },
    { "fact": "The origin story for Doctor Strange was heavily inspired by the fictional sorcerer Shang-Chi." },
    { "fact": "Ms. Marvel, Kamala Khan, is the first Muslim character to headline her own Marvel comic book." },
    { "fact": "Rocket Raccoon is a genetically engineered raccoon who is a master strategist and weapons expert." },
    { "fact": "Vision is an android created by Ultron, but later defected to fight alongside the Avengers." },
    { "fact": "Scarlet Witch's powers are based on chaos magic, which allows her to warp reality." },
    { "fact": "Ant-Man can shrink down to the size of an ant while retaining his normal human strength." },
    { "fact": "The Wasp can fly and shrink down to the size of a wasp, and has blasters that fire bioelectric energy." },
    { "fact": "Blade is a human-vampire hybrid who hunts down evil vampires." },
    { "fact": "Daredevil is a blind lawyer who uses his heightened senses to fight crime." },
    { "fact": "Luke Cage is unbreakable and has super strength." },
    { "fact": "Iron Fist can channel his chi into his fists to deliver powerful blows." },
    { "fact": "Jessica Jones is a private investigator with superhuman strength and durability." },
    { "fact": "Moon Knight is a former mercenary who suffers from dissociative identity disorder and is empowered by the moon god Khonshu." },
    { "fact": "Squirrel Girl has a surprising ability to defeat powerful characters, even defeating Thanos in the comics." },
    { "fact": "Colossus is a mutant with superhuman strength and impenetrable metal skin." },
    { "fact": "Cyclops can fire powerful optic blasts from his eyes." },
    { "fact": "Jean Grey is a powerful telekinetic and telepath who has also been known as Phoenix, a cosmic entity." }
  ]

  let contentList: any[] = [];
  for(let item of dataSet){
    let content: any = {
      pageContent: item.fact
    }
    contentList.push(content);
  }

  await pgvectorStore.addDocuments(contentList);
  console.log("documents added")
}

main();
