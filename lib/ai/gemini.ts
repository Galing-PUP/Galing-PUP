import { GoogleGenAI } from '@google/genai'

// The new SDK uses a simpler initialization pattern
export const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function runGemini(context: string, question: string) {
    const prompt = `
Task: Produce a Critical Technical Summary.

Rules:
- No first-person language.
- No role self-references.
- No phrases like “as a researcher”, “this paper shows”, “we conclude”.
- Output must be neutral, third-person, technical.
- Do not include meta commentary.
- Do not restate the question.
- Use concise, academic tone.

Output structure (mandatory):

## Methodology
<content>

## Mechanism
<content>

## Results
<content>

## Conclusion
<content>

Context:
${context}

Question:
${question}
c
`
    const response = await genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
    })

    return response.text
}