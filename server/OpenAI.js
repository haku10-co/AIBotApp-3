"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
// langchainライブラリから必要なモジュールをインポートします。
const openai_1 = require("langchain/llms/openai");
const prompts_1 = require("langchain/prompts");
const memory_1 = require("langchain/memory");
const chains_1 = require("langchain/chains");
const text_1 = require("langchain/document_loaders/fs/text");
const memory_2 = require("langchain/vectorstores/memory");
const openai_2 = require("langchain/embeddings/openai");
const text_splitter_1 = require("langchain/text_splitter");
// 環境変数をロードするためのdotenv設定
require("dotenv").config();
// アプリケーションのメイン関数です。
const run = async function* (initialInput) {
    // LLM（Large Language Model）を初期化します。
    const llm_1 = new openai_1.OpenAI({ temperature: 1, modelName: "gpt-3.5-turbo-1106" , verbose: true });
    // BufferMemoryを初期化します。これは会話のコンテキストを保存します。
    const memory = new memory_1.BufferMemory();
    // ConversationChainを初期化します。これは会話を続けるためのチェーンです。
    const chain = new chains_1.ConversationChain({ llm: llm_1, memory });
    class CustomTextSplitter extends text_splitter_1.TextSplitter {
        async splitText(text) {
            // 行ごとにテキストを分割し、undefinedと空文字列をフィルタリングします。
            return text.split('\n').filter(line => line !== undefined && line !== '');
        }
    }
    // テキストローダーを使ってドキュメントを読み込みます。
    const loader0 = new text_1.TextLoader("./server/document_loaders/example_data/サービスについてのQA.txt");
    const docs1 = await loader0.load();
    const loader1 = new text_1.TextLoader("./server/document_loaders/example_data/代理店募集についてのQA.txt");
    const docs2 = await loader1.load();
    // 別のテキストファイルからキャラクター情報を読み込みます。
    const loader2 = new text_1.TextLoader("./server/document_loaders/setting_data/set.txt");
    const characterInfo = await loader2.load();
    // Documentオブジェクトを作成し、読み込んだドキュメントを保持します。
    // OpenAIEmbeddingsを初期化します。これはOpenAIのEmbeddings APIを使って単語の埋め込みを取得します。
    const docs = [...docs1, ...docs2];
    // ドキュメントを分割します。
    const textSplitter = new CustomTextSplitter();
    const splitDocs = await textSplitter.splitDocuments(docs);
    const embeddings = new openai_2.OpenAIEmbeddings();
    const vectorStore = await memory_2.MemoryVectorStore.fromDocuments(splitDocs, embeddings);
    // PromptTemplateを設定します。これはユーザーの質問に基づいてプロンプトを生成します。
    const prompt = new prompts_1.PromptTemplate({
        inputVariables: ["question"],
        template: "{question}がわからないようなので教えて",
    });
    try {
        console.log('Initial input:', initialInput);
        const initialPrompt = await prompt.format({ question: initialInput });
        console.log('Initial prompt:', initialPrompt);

        const initialResults = await vectorStore.similaritySearch(initialInput);
        const combinedInitialInput = `${initialPrompt}\n関連情報: ${initialResults[0].pageContent}\nキャラクター情報: ${characterInfo[0].pageContent}`;
        const initialResponse = await chain.call({ input: combinedInitialInput });
        console.log('Initial response:', initialResponse);
        if (!initialResponse || !initialResponse.response) {
            console.error('Initial response is undefined or invalid');
            yield 'エラーが発生しました。';
            return;
        }
        yield initialResponse.response;
        // 初期の質問を受け取ります。
        while (true) {
            console.log('Waiting for next input...');
            const nextInput = yield; // 次の入力を受け取る
            console.log('Received next input:', nextInput);
            // nextInput が提供されているか確認
            if (!nextInput) {
                // nextInput が undefined または空の文字列の場合、処理をスキップ
                continue;
            }
            // nextInput が 'exit' の場合、ループを終了する
            if (nextInput.toLowerCase() === 'exit') {
                return;
            }
            // ユーザーの入力とドキュメントの内容を組み合わせて次の入力を生成
            const results = await vectorStore.similaritySearch(nextInput);
            const combinedInput = `${nextInput}\nベクター検索QandA結果の回答部分を補足するように説明して: ${results[0].pageContent}\nキャラクター情報: ${characterInfo[0].pageContent}`;
            try {
                const response = await chain.call({ input: combinedInput });
                console.log('Response:', response.response);
                yield response.response; // 回答を返す
            } catch (error) {
                console.error('Error calling chain:', error);
                yield 'エラーが発生しました。';
            }
        }
    }catch (error) {
        console.error('Error in run function:', error);
        yield 'エラーが発生しました。';
    }
};
exports.run = run;
//# sourceMappingURL=index.js.map