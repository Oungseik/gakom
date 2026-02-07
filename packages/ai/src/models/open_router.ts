import { ChatOpenAI } from "@langchain/openai";

export const getModel = (param: { model: string; apiKey: string; baseURL?: string }) =>
  new ChatOpenAI({
    model: param.model,
    apiKey: param.apiKey,
    configuration: { baseURL: param.baseURL },
  });
