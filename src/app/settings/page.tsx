'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Key, 
  Volume2, 
  CheckCircle, 
  XCircle,
  Info,
  ExternalLink,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner';
import ElevenLabsService from '@/lib/elevenlabsService';
import Link from 'next/link';

const SettingsPage = () => {
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usageStats, setUsageStats] = useState<any>(null);

  const elevenLabsService = ElevenLabsService.getInstance();

  useEffect(() => {
    checkExistingKey();
  }, [])

  const checkExistingKey = () => {
    const isAvailable = elevenLabsService.isServiceAvailable();
    setIsKeySet(isAvailable);
    if (isAvailable) {
      loadUsageStats();
    }
  }

  const loadUsageStats = async () => {
    setIsLoading(true);
    try {
      const stats = await elevenLabsService.getUsageStats();
      setUsageStats(stats);
    } catch (error) {
      console.error('Error loading usage stats:', error)
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveKey = () => {
    if (!elevenLabsKey.trim()) {
      toast.error('Please enter a valid API key');
      return
    }

    try {
      elevenLabsService.setApiKey(elevenLabsKey.trim());
      setIsKeySet(true);
      setElevenLabsKey('');
      toast.success('✅ ElevenLabs API key saved successfully!');
      loadUsageStats();
    } catch (error) {
      toast.error('Failed to save API key');
    }
  }

  const handleRemoveKey = () => {
    elevenLabsService.removeApiKey();
    setIsKeySet(false);
    setUsageStats(null);
    toast.info('ElevenLabs API key removed');
  }

  const testVoice = async () => {
    setIsLoading(true);
    try {
      const result = await elevenLabsService.textToSpeech(;
        'Hello! This is a test of the ElevenLabs AI voice. Your virtual interview will sound just like this.',
        {
          personality: 'professional';
          onStart: () => toast.info('🎙️ Playing test voice...'),
          onEnd: () => {
            toast.success('✅ Voice test completed!');
            setIsLoading(false);
          },
          onError: (error) => {
            toast.error('Voice test failed');
            setIsLoading(false);
          }
        }
      )

      if (!result.success) {
        toast.error(result.error || 'Voice test failed');
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('Voice test failed');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Settings className="w-8 h-8 text-purple-600" />
            Virtual Interview Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Configure your AI-powered interview experience
          </p>
        </div>

        {/* ElevenLabs API Key Configuration */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-purple-600" />
              ElevenLabs AI Voice Configuration
            </CardTitle>
            <CardDescription>
              Add your ElevenLabs API key to enable ultra-realistic AI voice for virtual interviews
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                {isKeySet ? (
                  <Badge className="bg-green-500 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Not Configured (Using Standard Voice)
                  </Badge>
                )}
              </div>
              
              {isKeySet && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveKey}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Key
                </Button>
              )}
            </div>

            {/* Usage Stats */}
            {isKeySet && usageStats && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-900">Usage Statistics</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadUsageStats}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Characters Used:</span>
                      <span className="font-medium text-blue-900">
                        {usageStats.character_count.toLocaleString()} / {usageStats.character_limit.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(usageStats.character_count / usageStats.character_limit) * 100}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-blue-600">
                      Remaining: {(usageStats.character_limit - usageStats.character_count).toLocaleString()} characters
                      (~{Math.floor((usageStats.character_limit - usageStats.character_count) / 500)} interviews)
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* API Key Input */}
            {!isKeySet && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="elevenlabs-key" className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    ElevenLabs API Key
                  </Label>
                  <Input
                    id="elevenlabs-key"
                    type="password"
                    placeholder="Enter your ElevenLabs API key"
                    value={elevenLabsKey}
                    onChange={(e) => setElevenLabsKey(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <Button 
                  onClick={handleSaveKey}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Save API Key
                </Button>
              </div>
            )}

            {/* Test Voice Button */}
            {isKeySet && (
              <Button 
                onClick={testVoice}
                disabled={isLoading}
                variant="outline"
                className="w-full border-purple-300 hover:bg-purple-50"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {isLoading ? 'Testing...' : 'Test AI Voice'}
              </Button>
            )}

            {/* Info Box */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-sm text-blue-900">
                    <p className="font-medium">How to get your ElevenLabs API Key:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Visit <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="underline">elevenlabs.io</a></li>
                      <li>Sign up for a free account (10,000 characters/month)</li>
                      <li>Go to Profile → API Keys</li>
                      <li>Copy your API key and paste it above</li>
                    </ol>
                    <div className="pt-2">
                      <a 
                        href="https://elevenlabs.io/sign-up" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Sign up for ElevenLabs Free Tier
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features with ElevenLabs */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-purple-900 mb-3">With ElevenLabs Voice:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Ultra-realistic AI voice</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Natural conversation flow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>4 personality voices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Professional interview experience</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/virtual-ai-demo">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Volume2 className="w-4 h-4 mr-2" />
              Try Virtual AI Demo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage;
