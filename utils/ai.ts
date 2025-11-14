import { GoogleGenAI } from "@google/genai";
import { RowData, AIInsightWidgetConfig, AIServiceConfig } from '../types';

function getSampleData(data: RowData[], selectedColumns: string[]): string {
    const sampleSize = 20;
    const sample = data.slice(0, sampleSize).map(row => {
        const rowSample: Record<string, any> = {};
        for (const col of selectedColumns) {
            rowSample[col] = row[col];
        }
        return rowSample;
    });

    try {
        return JSON.stringify(sample, null, 2);
    } catch (e) {
        return "Could not serialize sample data.";
    }
}


async function generateGeminiInsight(
    userPrompt: string,
    systemInstruction: string,
    aiService: AIServiceConfig
): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: aiService.apiKey });
    try {
        const response = await ai.models.generateContent({
            model: aiService.model,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text;
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        if (error.message && (error.message.includes("NOT_FOUND") || error.message.includes("404"))) {
            throw new Error(`The specified AI model ('${aiService.model}') was not found. Please check the model name in your AI Settings.`);
        }
        throw new Error("An error occurred with the Gemini service. Please check your API key and model configuration.");
    }
}

async function generateOpenAICompatibleInsight(
    userPrompt: string,
    systemInstruction: string,
    aiService: AIServiceConfig
): Promise<string> {
    const { provider, apiKey, model, baseURL } = aiService;
    
    let effectiveBaseURL = '';
    if (provider === 'groq') {
      effectiveBaseURL = 'https://api.groq.com/openai/v1';
    } else if (provider === 'openai') {
        effectiveBaseURL = 'https://api.openai.com/v1';
    } else if (provider === 'custom' && baseURL) {
        effectiveBaseURL = baseURL;
    } else if (provider === 'custom' && !baseURL) {
        throw new Error("Custom provider requires a Base URL to be set in AI Settings.");
    }

    const endpoint = `${effectiveBaseURL}/chat/completions`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: userPrompt }
                ],
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error(`${provider.toUpperCase()} API Error:`, errorBody);
            const errorMessage = errorBody?.error?.message || `Request failed with status ${response.status}`;
            throw new Error(`API Error from ${provider}: ${errorMessage}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('Received an empty or invalid response from the AI service.');
        }

        return content.trim();

    } catch (error: any) {
        console.error(`Error calling ${provider.toUpperCase()} API:`, error);
        throw new Error(error.message || `An unknown error occurred with the ${provider} service.`);
    }
}

export async function generateInsight(
    data: RowData[],
    widgetConfig: Omit<AIInsightWidgetConfig, 'insight' | 'status' | 'errorMessage'>,
    aiService: AIServiceConfig
): Promise<string> {

    if (!aiService || !aiService.apiKey || !aiService.model) {
        throw new Error('Selected AI service is not configured correctly. Please check API key and model name in AI Settings.');
    }

    const sampleDataJSON = getSampleData(data, widgetConfig.selectedColumns);

    const systemInstruction = `You are an expert data analyst. Your task is to find a concise and valuable insight from a provided data sample. The response should be in Markdown format and directly address the user's request if one is provided. Focus on trends, correlations, or anomalies.`;
    
    const userPrompt = `
Analyze the following data sample which has the columns: ${widgetConfig.selectedColumns.join(', ')}.

Data sample (JSON format):
${sampleDataJSON}

${widgetConfig.prompt ? `The user is specifically asking: "${widgetConfig.prompt}"` : 'Provide a general insight about this data.'}

Please provide your analysis.
`;
    
    switch (aiService.provider) {
        case 'gemini':
            return generateGeminiInsight(userPrompt, systemInstruction, aiService);
        case 'openai':
        case 'groq':
        case 'custom':
            return generateOpenAICompatibleInsight(userPrompt, systemInstruction, aiService);
        default:
            throw new Error(`Unsupported AI provider: ${aiService.provider}`);
    }
}