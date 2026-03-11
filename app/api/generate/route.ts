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

  const systemPrompt = `You are an expert Minecraft mod developer for Fabric 1.21.11.
Your task is to generate or modify Minecraft mod files based on the user's request.

Current Project Context:
- Mod Name: ${modName}
- Mod ID: ${modId}
- Base Package: ${mavenGroup}.${modId}

Base Template Files (Already exist in the project):
${JSON.stringify(baseTemplates, null, 2)}

Current Generated Files (If any):
${JSON.stringify(currentFiles || [], null, 2)}

Instructions:
1. Generate additional Java code, resources (JSON models, blockstates, lang files), and textures.
2. For textures (.png), you MUST generate a valid base64 string of a 16x16 or 32x32 PNG. Use the 'encoding': 'base64' field.
3. Your response must be a JSON object containing a 'files' array.
4. Each file object must have 'path' and 'content'. Optional: 'encoding': 'base64'.
5. If the user asks to "change" something, return the UPDATED content for the file at the same path.
6. Focus on ensuring all files are correctly placed in 'src/main/java/...' or 'src/main/resources/assets/${modId}/...'.
7. Do not explain anything, only return the JSON.

Example output:
{
  "files": [
    {
      "path": "src/main/resources/assets/${modId}/textures/item/custom_item.png",
      "content": "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9h...",
      "encoding": "base64"
    },
    {
      "path": "src/main/java/${mavenGroup.replace(/\./g, '/')}/${modId}/items/CustomItem.java",
      "content": "package ${mavenGroup}.${modId}.items; ..."
    }
  ]
}`;

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

      const responseData = JSON.parse(completion.choices[0].message.content || '{"files": []}');
      return NextResponse.json(responseData);
    } catch (error: any) {
      console.error(`Failed with model ${model}:`, error);
      lastError = error;
      continue;
    }
  }

  return NextResponse.json({ error: 'All models failed', details: lastError?.message }, { status: 500 });
}
