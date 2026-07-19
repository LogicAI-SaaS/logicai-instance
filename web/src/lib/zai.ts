/**
 * Z.ai API Service
 * Service for interacting with Z.ai GLM 4.7 model
 */

interface ZaiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ZaiResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

export interface WorkflowGenerationResult {
  nodes: Array<{
    type: string;
    label: string;
    config: Record<string, any>;
    position?: { x: number; y: number };
  }>;
  edges: Array<{
    source: number; // Index du nœud source
    target: number; // Index du nœud target
  }>;
  explanation: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Generate workflow structure using Z.ai GLM 4.7 via backend API
 */
export async function generateWorkflow(
  userPrompt: string,
  availableNodes: Record<string, any>
): Promise<WorkflowGenerationResult> {
  const systemPrompt = createSystemPrompt(availableNodes);

  const messages: ZaiMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: userPrompt,
    },
  ];

  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required. Please login first.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/generate-workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Invalid response from backend');
    }

    const content = result.data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI Response:', content);

    // Try to extract JSON from code block first
    let jsonText = content;
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    } else {
      // Try to find JSON object
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
    }

    // Clean up the JSON text
    jsonText = jsonText.trim();

    try {
      const workflowResult: WorkflowGenerationResult = JSON.parse(jsonText);
      return workflowResult;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('JSON Text:', jsonText);
      throw new Error(`Invalid JSON format from AI: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error generating workflow:', error);
    throw error;
  }
}

/**
 * Create a strict system prompt with all available nodes
 */
function createSystemPrompt(availableNodes: Record<string, any>): string {
  const nodeDescriptions = Object.entries(availableNodes)
    .map(([type, metadata]) => {
      const fields = metadata.config || {};
      const fieldsList = Object.keys(fields).join(', ');
      return `- ${type}: ${metadata.description || 'No description'}\n  Champs: ${fieldsList || 'Aucun'}`;
    })
    .join('\n');

  return `Tu es un assistant expert en création de workflows automation. Tu dois STRICTEMENT générer des workflows en utilisant UNIQUEMENT les nœuds disponibles ci-dessous.

## NŒUDS DISPONIBLES:
${nodeDescriptions}

## RÈGLES STRICTES:
1. Tu dois UNIQUEMENT utiliser les types de nœuds listés ci-dessus
2. Chaque workflow doit commencer par un nœud TRIGGER (schedule, webhook, formTrigger, chatTrigger, etc.)
3. Les connexions doivent être logiques et suivre le flux d'exécution
4. Tous les champs de configuration doivent être remplis avec des valeurs par défaut appropriées
5. Les positions des nœuds doivent être espacées de 250px horizontalement

## FORMAT DE RÉPONSE (JSON STRICTEMENT):
Tu dois répondre UNIQUEMENT avec un objet JSON dans ce format exact:
\`\`\`json
{
  "nodes": [
    {
      "type": "nomDuType",
      "label": "Nom descriptif",
      "config": {
        "champ1": "valeur1",
        "champ2": "valeur2"
      },
      "position": { "x": 100, "y": 200 }
    }
  ],
  "edges": [
    {
      "source": 0,
      "target": 1
    }
  ],
  "explanation": "Workflow de recherche et notification créé avec succès.\n\nÉtapes du workflow:\n• L'utilisateur déclenche le workflow via un webhook\n• Une requête HTTP est envoyée à l'API externe\n• Les données sont traitées et formatées\n• Une notification est envoyée via Telegram\n\nNote: Pensez à configurer vos tokens et clés API."
}
\`\`\`

## IMPORTANT pour l'explication:
- Structure ton explication avec des sections claires et des sauts de ligne (\\n)
- Commence par un titre descriptif du workflow
- Liste les étapes avec des puces (•) ou des tirets (-)
- Termine par une note si nécessaire
- Utilise UNIQUEMENT des guillemets échappés (\\" ) si nécessaire
- N'utilise AUCUN emoji
- Sois détaillé et pédagogique

## EXEMPLES DE CONFIGURATIONS:

**httpRequest:**
{
  "type": "httpRequest",
  "label": "Appel API",
  "config": {
    "url": "https://api.example.com/data",
    "method": "GET",
    "headers": {}
  }
}

**chatTrigger:**
{
  "type": "chatTrigger",
  "label": "Déclencheur Chat",
  "config": {
    "platform": "textual"
  }
}

**openAI:**
{
  "type": "openAI",
  "label": "Génération IA",
  "config": {
    "model": "gpt-4",
    "prompt": "Analyser le texte suivant: {{ $json.message }}",
    "temperature": 0.7
  }
}

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`;
}
