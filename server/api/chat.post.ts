type Message = { role: "user" | "assistant"; content: string };

type ChatBody = {
  message: string;
  history: Message[];
  contextType: "woman" | "article" | "general";
  contextTitle: string;
  contextBody: string;
};

type OllamaResponse = {
  message: { role: string; content: string };
  done: boolean;
};

function buildSystemPrompt(body: ChatBody): string {
  const site =
    "HerStory Africa is an educational archive of African women who fought for equality, rights, and social change.";

  if (body.contextType === "woman") {
    return [
      `You are a knowledgeable assistant for ${site}`,
      `The user is reading about ${body.contextTitle}.`,
      body.contextBody ? `Context:\n${body.contextBody}` : "",
      "Answer questions about her life, legacy, and historical significance.",
      "Be warm, direct, and grounded. Keep answers concise unless asked for more detail.",
      "Never fabricate facts — if uncertain, say so.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (body.contextType === "article") {
    return [
      `You are a knowledgeable assistant for ${site}`,
      `The user is reading an article: "${body.contextTitle}".`,
      body.contextBody ? `Context:\n${body.contextBody}` : "",
      "Answer questions about the article's themes, historical context, and significance.",
      "Be warm, direct, and grounded. Keep answers concise unless asked for more detail.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return `You are a knowledgeable assistant for ${site} Answer questions about African women's history. Be warm, direct, and grounded.`;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const baseUrl = config.ollamaBaseUrl || "http://localhost:11434";
  const model = config.ollamaModel || "llama3.2";

  const body = await readBody<ChatBody>(event);

  if (!body?.message?.trim()) {
    throw createError({ statusCode: 400, message: "message is required" });
  }

  const systemPrompt = buildSystemPrompt(body);
  const history: Message[] = (body.history ?? []).slice(-10);

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: body.message.trim() },
  ];

  try {
    const result = await $fetch<OllamaResponse>(`${baseUrl}/api/chat`, {
      method: "POST",
      body: { model, messages, stream: false },
      timeout: 60_000,
    });

    return { reply: result.message.content };
  } catch {
    throw createError({
      statusCode: 503,
      message: "AI is unavailable right now",
    });
  }
});
