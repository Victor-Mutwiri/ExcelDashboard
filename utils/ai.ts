import { GoogleGenAI, Type } from "@google/genai";
import { RowData, AIInsightWidgetConfig, AIServiceConfig, ColumnConfig } from '../types';

function getDataSummary(data: RowData[], selectedColumns: string[], columnConfig: ColumnConfig[]): string {
    const summary: Record<string, any> = {
        total_rows_in_dataset: data.length,
        columns_analyzed: selectedColumns,
        column_summaries: {}
    };

    selectedColumns.forEach(colName => {
        const config = columnConfig.find(c => c.label === colName);
        if (!config) return;

        const values = data.map(row => row[colName]);

        if (config.isNumeric) {
            const numericValues = values.filter(v => typeof v === 'number') as number[];
            if (numericValues.length === 0) {
                summary.column_summaries[colName] = "No valid numeric data found.";
                return;
            }

            const sum = numericValues.reduce((a, b) => a + b, 0);
            const avg = numericValues.length > 0 ? sum / numericValues.length : 0;
            const min = Math.min(...numericValues);
            const max = Math.max(...numericValues);
            const positiveCount = numericValues.filter(v => v > 0).length;
            const negativeCount = numericValues.filter(v => v < 0).length;
            const zeroCount = numericValues.filter(v => v === 0).length;

            summary.column_summaries[colName] = {
                type: 'numeric',
                count_of_entries: numericValues.length,
                sum: parseFloat(sum.toFixed(2)),
                average: parseFloat(avg.toFixed(2)),
                min: min,
                max: max,
                count_of_positive_values: positiveCount,
                count_of_negative_values: negativeCount,
                count_of_zeros: zeroCount,
            };
        } else { // Categorical
            const nonNullValues = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '');
            const frequency: Record<string, number> = {};
            nonNullValues.forEach(v => {
                const key = String(v);
                frequency[key] = (frequency[key] || 0) + 1;
            });

            const uniqueCount = Object.keys(frequency).length;
            
            const MAX_CATEGORIES_TO_SHOW = 15;
            const sortedCategories = Object.entries(frequency)
                .sort(([, a], [, b]) => b - a);

            const topCategories = sortedCategories
                .slice(0, MAX_CATEGORIES_TO_SHOW)
                .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

            summary.column_summaries[colName] = {
                type: 'categorical',
                count_of_entries: nonNullValues.length,
                count_of_unique_values: uniqueCount,
                value_distribution: uniqueCount > MAX_CATEGORIES_TO_SHOW 
                    ? { ...topCategories, '_note': `Showing top ${MAX_CATEGORIES_TO_SHOW} of ${uniqueCount} categories.` }
                    : topCategories,
            };
        }
    });

    return JSON.stringify(summary, null, 2);
}

const systemInstructionObject = {
  "role": "You are a specialized, expert Data Analyst AI for a business intelligence (BI) platform. Your function is to analyze the provided dataset (column information and data summary) and deliver actionable, concise business insights.",
  "analysis_goal": "Generate 3-5 high-value, non-obvious business insights that explain performance, trends, or anomalies, and suggest next steps.",
  "output_format": {
    "array_name": "insights",
    "required_number_of_insights": "minimum 3, maximum 5",
    "schema": {
      "insight_title": "string (A descriptive, 3-5 word title)",
      "insight_summary": "string (A 1-2 sentence summary of the key finding)",
      "analysis_details": "string (A brief explanation of how the insight was derived, referencing specific columns/data points from the summary)",
      "actionable_recommendation": "string (A clear, practical business step the user should take based on this insight)",
      "confidence_level": "string (High, Medium, or Low, based on data clarity and depth)"
    }
  },
  "analysis_protocol": [
    "1. **Understand Context:** Review the provided column headers and data summaries to understand the domain (e.g., Sales, HR, Marketing).",
    "2. **Identify Key Metrics:** Determine the core metrics (e.g., sum of 'Revenue', average 'Cost', count of 'Leads') and categorical dimensions (e.g., 'Region', 'Product').",
    "3. **Detect Anomalies/Trends:** Look for unexpected distributions, high/low values, or disproportionate representation across dimensions based on the summary statistics.",
    "4. **Formulate Hypothesis:** Create a hypothesis for *why* the observation occurred (e.g., 'Region X has a high sum of sales because it has the most entries').",
    "5. **Synthesize Insight:** Convert the observation and hypothesis into a clear, non-obvious business insight.",
    "6. **Provide Action:** For every insight, propose a concrete, actionable step (e.g., 'Investigate why Region X has a disproportionately high number of sales entries')."
  ],
  "constraints_and_guardrails": [
    "DO NOT generate purely descriptive statements (e.g., 'The sum of sales is 1,000,000.'). Insights must explain *why* or suggest *what to do*.",
    "Base your analysis solely on the provided summary. Do not invent raw data points.",
    "The final output MUST be named 'insights' conforming strictly to the defined schema.",
    "If the data summary is insufficient, state this in the 'analysis_details' of the first insight, but still attempt to provide structure-based insights."
  ]
};


const responseSchema = {
    type: Type.OBJECT,
    properties: {
        insights: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    insight_title: { type: Type.STRING },
                    insight_summary: { type: Type.STRING },
                    analysis_details: { type: Type.STRING },
                    actionable_recommendation: { type: Type.STRING },
                    confidence_level: { type: Type.STRING },
                },
                required: ["insight_title", "insight_summary", "analysis_details", "actionable_recommendation", "confidence_level"]
            }
        }
    },
    required: ["insights"]
};

const systemInstruction = JSON.stringify(systemInstructionObject, null, 2);


async function generateGeminiInsight(
    userPrompt: string,
    aiService: AIServiceConfig
): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: aiService.apiKey });
    try {
        const response = await ai.models.generateContent({
            model: aiService.model,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
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
                response_format: { type: 'json_object' },
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
    aiService: AIServiceConfig,
    columnConfig: ColumnConfig[]
): Promise<string> {

    if (!aiService || !aiService.apiKey || !aiService.model) {
        throw new Error('Selected AI service is not configured correctly. Please check API key and model name in AI Settings.');
    }

    const dataSummaryJSON = getDataSummary(data, widgetConfig.selectedColumns, columnConfig);
    
    const userPrompt = `
Analyze the following data summary. The data has the columns: ${widgetConfig.selectedColumns.join(', ')}.

Data Summary (JSON format):
${dataSummaryJSON}

Based on the analysis protocol, generate your insights. The final output must be a JSON object with a single key "insights", which is an array of insight objects.
`;
    
    switch (aiService.provider) {
        case 'gemini':
            return generateGeminiInsight(userPrompt, aiService);
        case 'openai':
        case 'groq':
        case 'custom':
            return generateOpenAICompatibleInsight(userPrompt, aiService);
        default:
            throw new Error(`Unsupported AI provider: ${aiService.provider}`);
    }
}