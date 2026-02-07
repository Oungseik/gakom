// this is just example

import { createAgent, tool } from "langchain";
import * as z from "zod";
import { getModel } from "./models";

const getWeather = tool(({ city }) => `It's always sunny in ${city}!`, {
  name: "get_weather",
  description: "Get the weather for a given city",
  schema: z.object({
    city: z.string(),
  }),
});

const model = getModel({
  model: "deepseek/deepseek-v3.2",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const agent = createAgent({
  model,
  tools: [getWeather],
});

console.log(
  await agent.invoke({
    messages: [{ role: "user", content: "What's the weather in Tokyo?" }],
  }),
);
