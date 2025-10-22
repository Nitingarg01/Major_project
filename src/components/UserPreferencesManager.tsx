'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserInterviewPreferences } from '@/types/userPreferences';
import { 
  Settings, 
  Brain, 
  Users, 
  Building2, 
  Zap,
  Target,
  Gauge,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface UserPreferencesManagerProps {
  onPreferencesUpdated?: (preferences: UserInterviewPreferences) => void;
  showTitle?: boolean;
  compact?: boolean;
}

const UserPreferencesManager: React.FC<UserPreferencesManagerProps> = ({
  onPreferencesUpdated,
  showTitle = true,
  compact = false;
}) => {
  const [preferences, setPreferences] = useState<UserInterviewPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user-preferences');
      const data = await response.json();

      if (data.success) {
        setPreferences(data.preferences);
        console.log('📊 User preferences loaded:', data.preferences);
      } else {
        throw new Error(data.error || 'Failed to load preferences');
      }
    } catch (error: any) {
      console.error('❌ Error loading preferences:', error);
      toast.error('Failed to load preferences: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveUserPreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      const data = await response.json();

      if (data.success) {
        setHasChanges(false);
        toast.success('✅ Preferences saved successfully!');
        onPreferencesUpdated?.(data.preferences);
      } else {
        throw new Error(data.error || 'Failed to save preferences');
      }
    } catch (error: any) {
      console.error('❌ Error saving preferences:', error);
      toast.error('Failed to save preferences: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all preferences to defaults?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user-preferences', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setPreferences(data.preferences);
        setHasChanges(false);
        toast.success('✅ Preferences reset to defaults!');
        onPreferencesUpdated?.(data.preferences);
      } else {
        throw new Error(data.error || 'Failed to reset preferences');
      }
    } catch (error: any) {
      console.error('❌ Error resetting preferences:', error);
      toast.error('Failed to reset preferences: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (path: string, value: any) => {
    if (!preferences) return;

    const keys = path.split('.');
    const newPreferences = { ...preferences };
    let current: any = newPreferences;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    setPreferences(newPreferences);
    setHasChanges(true);
  };

  const updateDistribution = (category: string, value: number) => {
    if (!preferences) return;
    
    const newDistribution = { ...preferences.questionDistribution };
    const oldValue = newDistribution[category as keyof typeof newDistribution];
    const difference = value - oldValue;
    
    // Adjust other categories proportionally
    const otherCategories = Object.keys(newDistribution).filter(key => key !== category);
    const totalOthers = 100 - value;
    
    if (totalOthers >= 0) {
      newDistribution[category as keyof typeof newDistribution] = value;
      
      // Distribute remaining percentage among other categories
      const currentOthersTotal = otherCategories.reduce((sum, key) =>
        sum + newDistribution[key as keyof typeof newDistribution], 0);
      
      if (currentOthersTotal > 0) {
        otherCategories.forEach(key => {
          const currentValue = newDistribution[key as keyof typeof newDistribution];
          const proportion = currentValue / currentOthersTotal;
          newDistribution[key as keyof typeof newDistribution] = Math.max(0, Math.round(totalOthers * proportion));
        });
      }
      
      updatePreference('questionDistribution', newDistribution);
    }
  };

  if (loading && !preferences) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading your preferences...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-gray-600">Failed to load preferences</p>
            <Button onClick={loadUserPreferences} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" />
              Interview Preferences
            </h2>
            <p className="text-gray-600">Customize your interview question generation</p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                <AlertCircle className="w-3 h-3 mr-1" />
                Unsaved Changes
              </Badge>
            )}
            <Button variant="outline" onClick={resetToDefaults} disabled={saving}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={saveUserPreferences} disabled={saving || !hasChanges}>
              {saving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* General Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-purple-600" />
            General Preferences
          </CardTitle>
          <CardDescription>
            Overall interview settings and difficulty preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="defaultDifficulty">Default Difficulty Level</Label>
            <select
              id="defaultDifficulty"
              value={preferences.defaultDifficulty}
              onChange={(e) => updatePreference('defaultDifficulty', e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="easy">Easy - Foundational concepts</option>
              <option value="medium">Medium - Practical applications</option>
              <option value="hard">Hard - Advanced challenges</option>
              <option value="adaptive">Adaptive - Adjusts to performance</option>
            </select>
          </div>

          <div>
            <Label>Preferred Interview Types</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {['technical', 'behavioral', 'dsa', 'aptitude', 'mixed', 'system_design'].map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.preferredInterviewTypes.includes(type as any)}
                    onChange={(e) => {
                      const current = preferences.preferredInterviewTypes;
                      if (e.target.checked) {
                        updatePreference('preferredInterviewTypes', [...current, type]);
                      } else {
                        updatePreference('preferredInterviewTypes', current.filter(t => t !== type));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="capitalize text-sm">{type.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Question Distribution
          </CardTitle>
          <CardDescription>
            Adjust the percentage of different question types in mixed interviews
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(preferences.questionDistribution).map(([category, percentage]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="capitalize">{category.replace('_', ' ')}</Label>
                <span className="text-sm font-medium">{percentage}%</span>
              </div>
              <Slider
                value={[percentage]}
                onValueChange={([value]) => updateDistribution(category, value)}
                max={80}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          ))}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            💡 Total should be around 100%. Adjusting one category will automatically adjust others.
          </div>
        </CardContent>
      </Card>

      {/* Technical Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-orange-600" />
            Technical Preferences
          </CardTitle>
          <CardDescription>
            Configure technical question focus areas and depth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="industrySpecific">Industry-Specific Questions</Label>
                <Switch
                  id="industrySpecific"
                  checked={preferences.technicalPreferences.industrySpecific}
                  onCheckedChange={(checked) => updatePreference('technicalPreferences.industrySpecific', checked)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="modernTechStack">Modern Tech Stack Focus</Label>
                <Switch
                  id="modernTechStack"
                  checked={preferences.technicalPreferences.modernTechStack}
                  onCheckedChange={(checked) => updatePreference('technicalPreferences.modernTechStack', checked)}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Technical Focus Areas</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {[
                'algorithms', 'system_design', 'databases', 'architecture', 
                'security', 'performance', 'testing', 'devops', 'cloud'
              ].map((area) => (
                <label key={area} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.technicalPreferences.focusAreas.includes(area)}
                    onChange={(e) => {
                      const current = preferences.technicalPreferences.focusAreas;
                      if (e.target.checked) {
                        updatePreference('technicalPreferences.focusAreas', [...current, area]);
                      } else {
                        updatePreference('technicalPreferences.focusAreas', current.filter(a => a !== area));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-xs capitalize">{area.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Behavioral Preferences
          </CardTitle>
          <CardDescription>
            Configure behavioral assessment focus areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(preferences.behavioralPreferences).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <Switch
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => updatePreference(`behavioralPreferences.${key}`, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Company Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Company-Specific Preferences
          </CardTitle>
          <CardDescription>
            Configure how company information influences question generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(preferences.companyPreferences).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <Switch
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => updatePreference(`companyPreferences.${key}`, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Advanced Settings
          </CardTitle>
          <CardDescription>
            Fine-tune interview experience and question generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="questionDepth">Question Depth</Label>
            <select
              id="questionDepth"
              value={preferences.advancedSettings.questionDepth}
              onChange={(e) => updatePreference('advancedSettings.questionDepth', e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
            >
              <option value="surface">Surface - Quick overview questions</option>
              <option value="moderate">Moderate - Standard depth</option>
              <option value="deep">Deep - In-depth exploration</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(preferences.advancedSettings)
              .filter(([key]) => key !== 'questionDepth')
              .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Switch
                    id={key}
                    checked={value as boolean}
                    onCheckedChange={(checked) => updatePreference(`advancedSettings.${key}`, checked)}
                  />
                </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      {!compact && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Preferences Configuration Complete</p>
                  <p className="text-sm text-gray-600">
                    Your interview questions will now be generated based on these preferences
                  </p>
                </div>
              </div>
              <Button 
                onClick={saveUserPreferences} 
                disabled={saving || !hasChanges}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {hasChanges ? 'Save All Changes' : 'Saved'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserPreferencesManager;