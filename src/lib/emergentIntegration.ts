/**
 * Emergent Integration Manager
 * Handles seamless integration with Emergent LLM services
 * Provides universal key management for OpenAI, Anthropic, and Google models
 */

import { config } from 'dotenv';

// Load environment variables
if (typeof process !== 'undefined') {
  config();
}

interface EmergentIntegrationConfig {
  apiKey: string;
  baseUrl: string;
  providers: {
    openai: {
      models: string[];
      defaultModel: string;
      useCases: string[];
    };
    anthropic: {
      models: string[];
      defaultModel: string;
      useCases: string[];
    };
    google: {
      models: string[];
      defaultModel: string;
      useCases: string[];
    };
  };
}

export class EmergentIntegrationManager {
  private static instance: EmergentIntegrationManager;
  private config: EmergentIntegrationConfig;

  private constructor() {
    this.config = {
      apiKey: process.env.EMERGENT_LLM_KEY || process.env.NEXT_PUBLIC_EMERGENT_LLM_KEY || '',
      baseUrl: 'https://integrations.emergentagent.com/api/v1/llm/chat',
      providers: {
        openai: {
          models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
          defaultModel: 'gpt-4o-mini',
          useCases: [
            'Interview question generation',
            'DSA problem creation', 
            'Quick responses',
            'Structured content generation'
          ]
        },
        anthropic: {
          models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
          defaultModel: 'claude-3-5-sonnet-20241022',
          useCases: [
            'Response analysis and feedback',
            'Overall performance evaluation',
            'Detailed reasoning and analysis',
            'Complex problem solving'
          ]
        },
        google: {
          models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
          defaultModel: 'gemini-1.5-flash',
          useCases: [
            'Company intelligence lookup',
            'Fast simple tasks',
            'Fallback processing',
            'Cost-effective operations'
          ]
        }
      }
    };

    console.log('🔗 EmergentIntegrationManager initialized with providers:', {
      openai: this.config.providers.openai.models.length,
      anthropic: this.config.providers.anthropic.models.length,
      google: this.config.providers.google.models.length,
      keyConfigured: !!this.config.apiKey
    });
  }

  public static getInstance(): EmergentIntegrationManager {
    if (!EmergentIntegrationManager.instance) {
      EmergentIntegrationManager.instance = new EmergentIntegrationManager();
    }
    return EmergentIntegrationManager.instance;
  }

  public getApiKey(): string {
    return this.config.apiKey;
  }

  public isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  public getOptimalProvider(task: string): { provider: string; model: string; reasoning: string } {
    const taskLower = task.toLowerCase();
    
    // Question generation - OpenAI GPT-4o-mini (fastest, most reliable)
    if (taskLower.includes('question') || taskLower.includes('generate') || taskLower.includes('dsa')) {
      return {
        provider: 'openai',
        model: this.config.providers.openai.defaultModel,
        reasoning: 'OpenAI GPT-4o-mini provides fastest, most reliable question generation with excellent structured output'
      };
    }
    
    // Analysis and feedback - Anthropic Claude 3.5 Sonnet (best analysis quality)
    if (taskLower.includes('analyz') || taskLower.includes('feedback') || taskLower.includes('evaluation') || taskLower.includes('performance')) {
      return {
        provider: 'anthropic',
        model: this.config.providers.anthropic.defaultModel,
        reasoning: 'Anthropic Claude 3.5 Sonnet excels at detailed analysis, reasoning, and constructive feedback'
      };
    }
    
    // Company intelligence, simple tasks - Google Gemini (fast and cost-effective)
    if (taskLower.includes('company') || taskLower.includes('simple') || taskLower.includes('lookup')) {
      return {
        provider: 'google',
        model: this.config.providers.google.defaultModel,
        reasoning: 'Google Gemini 1.5 Flash provides fast, cost-effective processing for simpler tasks'
      };
    }
    
    // Default to OpenAI for general tasks
    return {
      provider: 'openai',
      model: this.config.providers.openai.defaultModel,
      reasoning: 'OpenAI GPT-4o-mini as default for general-purpose tasks with good speed/quality balance'
    };
  }

  public async makeRequest(
    messages: Array<{ role: string; content: string }>,
    task: string = 'general',
    options: {
      provider?: string;
      model?: string;
      temperature?: number;
      max_tokens?: number;
    } = {}
  ): Promise<{
    content: string;
    provider: string;
    model: string;
    usage?: any;
  }> {
    if (!this.config.apiKey) {
      throw new Error('Emergent API key not configured. Please set EMERGENT_LLM_KEY in your environment variables.');
    }

    // Get optimal provider if not specified
    const optimal = options.provider ? 
      { provider: options.provider, model: options.model || 'default', reasoning: 'User specified' } :
      this.getOptimalProvider(task);

    const requestBody = {
      messages,
      provider: optimal.provider,
      model: options.model || optimal.model,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 4000
    };

    console.log(`🚀 Making Emergent API request:`, {
      provider: optimal.provider,
      model: requestBody.model,
      reasoning: optimal.reasoning,
      messages: messages.length
    });

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Emergent API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ Emergent API response received from ${optimal.provider}`);

      return {
        content: data.content || data.message || 'No response received',
        provider: optimal.provider,
        model: requestBody.model,
        usage: data.usage
      };
    } catch (error) {
      console.error(`❌ Emergent API request failed:`, error);
      throw error;
    }
  }

  public getProviderInfo(provider: string): any {
    return this.config.providers[provider as keyof typeof this.config.providers] || null;
  }

  public getAllProviders(): typeof this.config.providers {
    return this.config.providers;
  }

  public async healthCheck(): Promise<{
    status: 'healthy' | 'partial' | 'unavailable';
    details: {
      apiKeyConfigured: boolean;
      emergentServiceReachable: boolean;
      providersAvailable: string[];
      lastChecked: string;
    };
  }> {
    const details = {
      apiKeyConfigured: !!this.config.apiKey,
      emergentServiceReachable: false,
      providersAvailable: [] as string[],
      lastChecked: new Date().toISOString()
    };

    if (!this.config.apiKey) {
      return {
        status: 'unavailable',
        details
      };
    }

    try {
      // Test with a simple request
      const testResponse = await this.makeRequest([
        { role: 'user', content: 'Test connection' }
      ], 'test', { max_tokens: 10 });
      
      details.emergentServiceReachable = true;
      details.providersAvailable = [testResponse.provider];
      
      return {
        status: 'healthy',
        details
      };
    } catch (error) {
      console.warn('Emergent service health check failed:', error);
      return {
        status: 'unavailable',
        details
      };
    }
  }
}

export const emergentIntegration = EmergentIntegrationManager.getInstance();
export default EmergentIntegrationManager;