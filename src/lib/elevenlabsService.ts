/**
 * ElevenLabs Text-to-Speech Service
 * Provides realistic AI voice for virtual interviews
 * Fallback to browser TTS if API key not available or quota exceeded
 */

interface VoiceSettings {
  stability: number
  similarity_boost: number
  style?: number
  use_speaker_boost?: boolean
}

interface ElevenLabsConfig {
  apiKey?: string
  voiceId?: string
  model?: string
  voiceSettings?: VoiceSettings
}

export class ElevenLabsService {
  private static instance: ElevenLabsService
  private apiKey: string | null = null;
  private voiceId: string = 'EXAVITQu4vr4xnSDxMaL' // Default: Sarah - Professional female voice;
  private model: string = 'eleven_turbo_v2' // Fast, low-latency model;
  private isAvailable: boolean = false;
  private quotaExceeded: boolean = false;

  // Voice profiles for different interviewer personalities
  private voiceProfiles = {
    professional: {
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah
      settings: { stability: 0.5, similarity_boost: 0.75, use_speaker_boost: true }
    },
    friendly: {
      voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam
      settings: { stability: 0.4, similarity_boost: 0.8, use_speaker_boost: true }
    },
    strict: {
      voiceId: 'TxGEqnHWrfWFTfGW9XjX', // Josh
      settings: { stability: 0.7, similarity_boost: 0.7, use_speaker_boost: true }
    },
    encouraging: {
      voiceId: 'jsCqWAovK2LkecY7zXl4', // Freya
      settings: { stability: 0.3, similarity_boost: 0.85, use_speaker_boost: true }
    }
  }

  private constructor() {
    this.initialize()
  }

  public static getInstance(): ElevenLabsService {
    if (!ElevenLabsService.instance) {
      ElevenLabsService.instance = new ElevenLabsService();
    }
    return ElevenLabsService.instance;
  }

  private initialize() {
    // Check for API key in environment
    if (typeof window === 'undefined') {
      // Server-side
      this.apiKey = process.env.ELEVENLABS_API_KEY || null;
    } else {
      // Client-side - check localStorage for user-provided key
      const storedKey = localStorage.getItem('elevenlabs_api_key');
      this.apiKey = storedKey || null;
    }

    this.isAvailable = !!this.apiKey;
    console.log('🎙️ ElevenLabs Service:', this.isAvailable ? 'Available' : 'Using fallback (Browser TTS)')
  }

  /**
   * Set API key (can be called from settings page)
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.isAvailable = true;
    this.quotaExceeded = false;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('elevenlabs_api_key', apiKey)
    }
    
    console.log('✅ ElevenLabs API key configured')
  }

  /**
   * Remove API key
   */
  public removeApiKey(): void {
    this.apiKey = null;
    this.isAvailable = false;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('elevenlabs_api_key')
    }
  }

  /**
   * Check if ElevenLabs is available
   */
  public isServiceAvailable(): boolean {
    return this.isAvailable && !this.quotaExceeded;
  }

  /**
   * Set voice personality
   */
  public setVoicePersonality(personality: 'professional' | 'friendly' | 'strict' | 'encouraging'): void {
    const profile = this.voiceProfiles[personality]
    if (profile) {
      this.voiceId = profile.voiceId;
      console.log(`🎭 Voice personality set to: ${personality}`)
    }
  }

  /**
   * Generate speech using ElevenLabs API
   */
  public async textToSpeech(
    text: string,
    options?: {
      personality?: 'professional' | 'friendly' | 'strict' | 'encouraging'
      onStart?: () => void
      onEnd?: () => void
      onError?: (error: any) => void
    }
  ): Promise<{ success: boolean; audio?: HTMLAudioElement; error?: string }> {
    
    // If not available, return error to trigger fallback
    if (!this.isServiceAvailable()) {
      return {
        success: false,
        error: this.quotaExceeded ? 'Quota exceeded' : 'API key not configured'
      }
    }

    try {
      // Get voice settings based on personality
      const personality = options?.personality || 'professional';
      const profile = this.voiceProfiles[personality]
      const voiceId = profile.voiceId;
      const voiceSettings = profile.settings;

      // Call ElevenLabs API
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey!
          },
          body: JSON.stringify({
            text: text,
            model_id: this.model,
            voice_settings: voiceSettings
          })
        }
      )

      if (!response.ok) {
        // Check for quota exceeded
        if (response.status === 401 || response.status === 429) {
          this.quotaExceeded = true;
          console.warn('⚠️ ElevenLabs quota exceeded, falling back to browser TTS')
          return { success: false, error: 'Quota exceeded' }
        }
        
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create audio element
      const audio = new Audio(audioUrl);
      
      // Set up event handlers
      audio.onplay = () => {
        if (options?.onStart) options.onStart()
      }
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl) // Clean up
        if (options?.onEnd) options.onEnd()
      }
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl)
        if (options?.onError) options.onError(error)
      }

      // Play audio
      await audio.play()

      return { success: true, audio }

    } catch (error) {
      console.error('❌ ElevenLabs TTS error:', error)
      if (options?.onError) options.onError(error)
      return { success: false, error: String(error) }
    }
  }

  /**
   * Get available voices from ElevenLabs
   */
  public async getAvailableVoices(): Promise<any[]> {
    if (!this.apiKey) {
      return []
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || []

    } catch (error) {
      console.error('Error fetching voices:', error)
      return []
    }
  }

  /**
   * Get usage statistics
   */
  public async getUsageStats(): Promise<{
    character_count: number
    character_limit: number
    can_use_instant_voice_cloning: boolean
  } | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: {
          'xi-api-key': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch usage: ${response.status}`);
      }

      const data = await response.json();
      return {
        character_count: data.subscription.character_count,
        character_limit: data.subscription.character_limit,
        can_use_instant_voice_cloning: data.subscription.can_use_instant_voice_cloning
      }

    } catch (error) {
      console.error('Error fetching usage stats:', error)
      return null;
    }
  }

  /**
   * Reset quota exceeded flag (call this daily or when user adds credits)
   */
  public resetQuotaFlag(): void {
    this.quotaExceeded = false;
  }
}

export default ElevenLabsService;
