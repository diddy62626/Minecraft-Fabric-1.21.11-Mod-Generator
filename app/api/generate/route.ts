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
  const { prompt, modId, modName, mavenGroup } = await req.json();

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY is not set' }, { status: 500 });
  }

  const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  let lastError = null;
  for (const model of MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: "You are an expert Minecraft mod developer for Fabric 1.21.1. " +
            "Generate additional Java code and resources based on the user's request. " +
            "Your response must be a JSON object containing a 'files' array. " +
            "Each file should have 'path' and 'content'. " +
            `The base package is ${mavenGroup}.${modId}. ` +
            "Do not include the base template files (build.gradle, fabric.mod.json, etc.). " +
            "Focus on requested features like Items, Blocks, Entities, or Logic. " +
            "Example: " +
            '{ "files": [ { "path": "src/main/java/com/example/mod/items/CustomItem.java", "content": "package com.example.mod.items; ..." } ] }'
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: model,
        response_format: { type: 'json_object' },
      });

      return NextResponse.json(JSON.parse(completion.choices[0].message.content || '{}'));
    } catch (error: any) {
      console.error(`Failed with model ${model}:`, error);
      lastError = error;
      continue;
    }
  }

  return NextResponse.json({ error: 'All models failed', details: lastError?.message }, { status: 500 });
}
