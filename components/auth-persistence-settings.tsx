'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { Info, Shield, Monitor, Smartphone } from 'lucide-react';
import { 
  PersistenceType, 
  PERSISTENCE_OPTIONS, 
  setAuthPersistence, 
  getStoredPersistencePreference,
  isSharedDevice,
  getRecommendedPersistence
} from '../lib/auth-persistence';
import { auth } from '../lib/firebase';

interface AuthPersistenceSettingsProps {
  onPersistenceChange?: (type: PersistenceType) => void;
  showAdvanced?: boolean;
}

export const AuthPersistenceSettings: React.FC<AuthPersistenceSettingsProps> = ({
  onPersistenceChange,
  showAdvanced = false
}) => {
  const [selectedPersistence, setSelectedPersistence] = useState<PersistenceType>('local');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [recommended, setRecommended] = useState<PersistenceType>('local');

  useEffect(() => {
    const stored = getStoredPersistencePreference();
    const shared = isSharedDevice();
    const recommendedType = getRecommendedPersistence();
    
    setSelectedPersistence(stored);
    setRememberMe(stored === 'local');
    setIsShared(shared);
    setRecommended(recommendedType);
  }, []);

  const handlePersistenceChange = async (type: PersistenceType) => {
    setIsLoading(true);
    try {
      await setAuthPersistence(auth, type);
      setSelectedPersistence(type);
      setRememberMe(type === 'local');
      onPersistenceChange?.(type);
    } catch (error) {
      console.error('Error changing persistence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRememberMeChange = async (checked: boolean) => {
    const newType: PersistenceType = checked ? 'local' : 'session';
    await handlePersistenceChange(newType);
  };

  const getPersistenceIcon = (type: PersistenceType) => {
    switch (type) {
      case 'local':
        return <Smartphone className="h-4 w-4" />;
      case 'session':
        return <Monitor className="h-4 w-4" />;
      case 'none':
        return <Shield className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPersistenceColor = (type: PersistenceType) => {
    switch (type) {
      case 'local':
        return 'text-green-600';
      case 'session':
        return 'text-yellow-600';
      case 'none':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Sign-in Security
        </CardTitle>
        <CardDescription>
          Choose how long you want to stay signed in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isShared && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This appears to be a shared device. We recommend using session persistence for better security.
            </AlertDescription>
          </Alert>
        )}

        {!showAdvanced ? (
          // Simple "Remember Me" toggle
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="remember-me">Remember me</Label>
              <p className="text-sm text-muted-foreground">
                Stay signed in on this device
              </p>
            </div>
            <Switch
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={handleRememberMeChange}
              disabled={isLoading}
            />
          </div>
        ) : (
          // Advanced persistence options
          <RadioGroup
            value={selectedPersistence}
            onValueChange={(value) => handlePersistenceChange(value as PersistenceType)}
            disabled={isLoading}
          >
            {Object.entries(PERSISTENCE_OPTIONS).map(([type, config]) => (
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={type} />
                <Label htmlFor={type} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className={getPersistenceColor(type as PersistenceType)}>
                      {getPersistenceIcon(type as PersistenceType)}
                    </span>
                    <div>
                      <div className="font-medium capitalize">
                        {type === 'local' ? 'Stay signed in' : 
                         type === 'session' ? 'Until tab closes' : 
                         'Sign out on refresh'}
                        {type === recommended && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {config.description}
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {showAdvanced && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePersistenceChange(recommended)}
              disabled={isLoading || selectedPersistence === recommended}
              className="w-full"
            >
              Use Recommended Setting
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• <strong>Stay signed in:</strong> Best for personal devices</p>
          <p>• <strong>Until tab closes:</strong> Good for shared computers</p>
          <p>• <strong>Sign out on refresh:</strong> Most secure for sensitive data</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthPersistenceSettings; 