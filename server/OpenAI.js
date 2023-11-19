// 環境変数をロードするためのdotenv設定
require("dotenv").config();
// アプリケーションのメイン関数です。
const { OpenAI } = require("langchain/llms/openai"); // OpenAIクラスをインポート
const { PromptTemplate } = require("langchain/prompts"); // PromptTemplateクラスをインポート
const { BufferMemory } = require("langchain/memory"); // BufferMemoryクラスをインポート
const { ConversationChain } = require("langchain/chains"); // ConversationChainクラスをインポート
const { TextLoader } = require("langchain/document_loaders/fs/text"); // TextLoaderクラスをインポート
const { MemoryVectorStore } = require("langchain/vectorstores/memory"); // MemoryVectorStoreクラスをインポート
const { OpenAIEmbeddings } = require("langchain/embeddings/openai"); // OpenAIEmbeddingsクラスをインポート
const { TextSplitter } = require("langchain/text_splitter"); // TextSplitterクラスをインポー

const run = async function* (initialInput) {
  // LLM（Large Language Model）を初期化します。
  const llm_1 = new OpenAI({ temperature: 1, modelName: "gpt-3.5-turbo-1106",verbose: true, });
  // BufferMemoryを初期化します。これは会話のコンテキストを保存します。
  const memory = new BufferMemory();
  // ConversationChainを初期化します。これは会話を続けるためのチェーンです。
  const chain = new ConversationChain({ llm: llm_1, memory });

  class CustomTextSplitter extends TextSplitter {
    async splitText(text){
      // 行ごとにテキストを分割し、undefinedと空文字列をフィルタリングします。
      return text.split('\n').filter(line => line !== undefined && line !== '');
    }
  }
  
  // テキストローダーを使ってドキュメントを読み込みます。
  const loader0 = new TextLoader("./server/document_loaders/example_data/サービスについてのQA.txt");
  const docs1 = await loader0.load();
  const loader1 = new TextLoader("./server/document_loaders/example_data/代理店募集についてのQA.txt");
  const docs2 = await loader1.load();
  

  // 別のテキストファイルからキャラクター情報を読み込みます。
  const loader2 = new TextLoader("./server/document_loaders/setting_data/set.txt");
  const characterInfo = await loader2.load();

  // Documentオブジェクトを作成し、読み込んだドキュメントを保持します。
  
  // OpenAIEmbeddingsを初期化します。これはOpenAIのEmbeddings APIを使って単語の埋め込みを取得します。
  const docs = [...docs1, ...docs2];
  // ドキュメントを分割します。
  const textSplitter = new CustomTextSplitter();
  const splitDocs = await textSplitter.splitDocuments(docs);
  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
  // PromptTemplateを設定します。これはユーザーの質問に基づいてプロンプトを生成します。
  const prompt = new PromptTemplate({
    inputVariables: ["question"],
    template: "{question}",
  });

  const initialPrompt = await prompt.format({ question: initialInput });
  const initialResults = await vectorStore.similaritySearch(initialInput);
  const combinedInitialInput = `${initialPrompt}\n関連情報: ${initialResults[0].pageContent}\nキャラクター情報: ${characterInfo[0].pageContent}`;
  const initialResponse = await chain.call({ input: combinedInitialInput });
  yield initialResponse.response;


  
};
module.exports = { run }; // run関数をエクスポート
