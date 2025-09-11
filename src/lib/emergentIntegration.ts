/**
 * Emergent Integration Service
 * Handles communication with Emergent LLM API with improved error handling
 */

export interface EmergentIntegrationConfig {
  apiKey: string;
  baseUrl: string;
}

export interface EmergentLLMRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  provider?: 'openai' | 'anthropic' | 'gemini';
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface EmergentLLMResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class EmergentIntegration {
  private static instance: EmergentIntegration;
  private config: EmergentIntegrationConfig;
  private baseUrl = 'https://integrations.emergentagent.com/api/v1/llm/chat';

  private constructor() {
    this.config = {
      apiKey: process.env.EMERGENT_LLM_KEY || process.env.NEXT_PUBLIC_EMERGENT_LLM_KEY || '',
      baseUrl: this.baseUrl
    };
    
    console.log('🔧 EmergentIntegration initialized:', {
      hasApiKey: !!this.config.apiKey,
      baseUrl: this.config.baseUrl
    });
  }

  public static getInstance(): EmergentIntegration {
    if (!EmergentIntegration.instance) {
      EmergentIntegration.instance = new EmergentIntegration();
    }
    return EmergentIntegration.instance;
  }

  public isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  public async makeRequest(
    messages: EmergentLLMRequest['messages'],
    taskType: string = 'general',
    options: {
      provider?: string;
      model?: string;
      temperature?: number;
      max_tokens?: number;
    } = {}
  ): Promise<EmergentLLMResponse> {
    
    if (!this.isConfigured()) {
      throw new Error('Emergent API key not configured');
    }

    const requestPayload = {
      messages,
      provider: options.provider || 'openai',
      model: options.model || 'gpt-4o-mini',
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 4000
    };

    console.log(`🚀 Making Emergent request for ${taskType}:`, {
      provider: requestPayload.provider,
      model: requestPayload.model,
      messagesCount: messages.length
    });

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': 'RecruiterAI-PreferenceBasedGeneration/1.0'
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Emergent API error:', response.status, errorText);
        
        // Better error handling for specific status codes
        if (response.status === 401) {
          throw new Error('Invalid or expired Emergent API key');
        } else if (response.status === 403) {
          throw new Error('Emergent API access forbidden - check permissions');
        } else if (response.status === 404) {
          throw new Error('Emergent API endpoint not found - check URL and service availability');
        } else if (response.status === 429) {
          throw new Error('Emergent API rate limit exceeded - please try again later');
        } else if (response.status >= 500) {
          throw new Error('Emergent API server error - service temporarily unavailable');
        } else {
          throw new Error(`Emergent API error: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      
      console.log('✅ Emergent API response received:', {
        provider: data.provider || requestPayload.provider,
        model: data.model || requestPayload.model,
        hasContent: !!data.content
      });

      return {
        content: data.content || data.message || 'No response content received',
        provider: data.provider || requestPayload.provider,
        model: data.model || requestPayload.model,
        usage: data.usage
      };

    } catch (error: any) {
      console.error('❌ Emergent integration error:', error);
      
      // Re-throw known errors
      if (error.message.includes('Emergent API')) {
        throw error;
      }
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to reach Emergent API - check internet connection');
      }
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: Emergent API took too long to respond');
      }
      
      // Generic error
      throw new Error(`Emergent integration failed: ${error.message}`);
    }
  }

  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    provider: string;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    if (!this.isConfigured()) {
      return {
        status: 'unhealthy',
        provider: 'none',
        responseTime: 0,
        error: 'API key not configured'
      };
    }

    try {
      const response = await this.makeRequest([
        { role: 'user', content: 'Health check' }
      ], 'health-check', {
        max_tokens: 10
      });

      const responseTime = Date.now() - startTime;

      return {
        status: responseTime < 3000 ? 'healthy' : 'degraded',
        provider: response.provider,
        responseTime,
        error: responseTime >= 3000 ? 'Slow response time' : undefined
      };

    } catch (error: any) {
      return {
        status: 'unhealthy',
        provider: 'unknown',
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  public getStatus(): {
    configured: boolean;
    apiKey: string;
    baseUrl: string;
  } {
    return {
      configured: this.isConfigured(),
      apiKey: this.config.apiKey ? `${this.config.apiKey.substring(0, 8)}...` : 'Not configured',
      baseUrl: this.config.baseUrl
    };
  }

  public updateConfig(newConfig: Partial<EmergentIntegrationConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
    
    console.log('🔧 EmergentIntegration config updated:', {
      hasApiKey: !!this.config.apiKey,
      baseUrl: this.config.baseUrl
    });
  }
}

export const emergentIntegration = EmergentIntegration.getInstance();