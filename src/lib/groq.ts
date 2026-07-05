const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

export interface Message {
  role: "system" | "user" | "assistant"
  content: string
}

export async function callGroq(messages: Message[], apiKey: string): Promise<string> {
  const model = localStorage.getItem("careerdna_model") ?? "llama-3.1-8b-instant"
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 4096 }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Groq API error ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ""
}

export function parseJSON<T>(raw: string, fallback: T): T {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/) ?? raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  const text = match ? match[1] ?? match[0] : raw
  try {
    return JSON.parse(text.trim()) as T
  } catch {
    return fallback
  }
}
