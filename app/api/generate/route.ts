import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'qwen/qwen3-32b',
  'moonshotai/kimi-k2-instruct'
];

export async function POST(req: Request) {
  const { prompt, modId, modName, mavenGroup, currentFiles, baseTemplates } = await req.json();

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY is not set' }, { status: 500 });
  }

  const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  const systemPrompt = `You are a world-class Minecraft Fabric 1.21.11 Mod Architect.
Your goal is to manage the source code and resources for a mod project iteratively.

Project Info:
- Name: ${modName}
- ID: ${modId}
- Package: ${mavenGroup}.${modId}

Project State:
- Base Files (ReadOnly Templates):
${JSON.stringify(baseTemplates, null, 2)}

- Current Generated Files:
${JSON.stringify(currentFiles || [], null, 2)}

Instructions:
1. Analyze the user request and the current project state.
2. Determine which files need to be ADDED, MODIFIED, or REMOVED to fulfill the request.
3. You can generate Java code, JSON models, textures (base64 PNG), lang files, etc.
4. For textures, generate high-quality 16x16 or 32x32 base64 PNGs.
5. Your response MUST be a JSON object with two arrays: 'upsert' (files to add or update) and 'delete' (paths to remove).

Response Schema:
{
  "upsert": [
    {
      "path": "string",
      "content": "string",
      "encoding": "utf-8" | "base64"
    }
  ],
  "delete": ["string"]
}

Rules:
- Always use the correct Minecraft resource paths: src/main/resources/assets/${modId}/...
- Always use the correct Java package paths: src/main/java/${mavenGroup.replace(/\./g, '/')}/${modId}/...
- If you modify an existing file, provide the FULL new content.
- Be precise with Java syntax and Fabric API 0.104.0+1.21.1 conventions.
- DO NOT explain. Only return the JSON.`;

  let lastError = null;
  for (const model of MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        model: model,
        response_format: { type: 'json_object' },
      });

      const responseData = JSON.parse(completion.choices[0].message.content || '{"upsert": [], "delete": []}');
      return NextResponse.json(responseData);
    } catch (error: any) {
      console.error(`Failed with model ${model}:`, error);
      lastError = error;
      continue;
    }
  }

  return NextResponse.json({ error: 'All models failed', details: lastError?.message }, { status: 500 });
}
