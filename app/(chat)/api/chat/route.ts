import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this environment variable is set
});

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();
    console.log("Received data:", { messages, model });

    // Make the call to the OpenAI API
    const response = await openai.chat.completions.create({
      model: model || 'gpt-3.5-turbo', // Default to gpt-3.5-turbo if model isn't specified
      messages: messages,
    });

    const answer = response.choices[0]?.message?.content || "No response generated";

    // Log and return the response
    console.log("Generated response:", answer);
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Error processing chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}