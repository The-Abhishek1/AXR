// app/settings/appearance/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  Laptop,
  Palette,
  Eye,
  EyeOff,
  Type,
  Grid,
  Layout,
  Minimize2,
  Maximize2,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  Loader,
  Zap,
  Sparkles,
  Droplet,
  Brush,
  Contrast,
  RotateCcw,
  Save,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AppearanceSettingsPage() {
  const [settings, setSettings] = useState({
    theme: 'dark',
    primaryColor: '#6366f1',
    accentColor: '#8b5cf6',
    fontSize: 'medium',
    fontFamily: 'inter',
    borderRadius: 'medium',
    animations: true,
    reducedMotion: false,
    highContrast: false,
    compactMode: false,
    sidebarCollapsed: false,
    showLabels: true,
    showIcons: true,
    density: 'comfortable',
    glassEffect: true,
    blurIntensity: 10,
    transparency: true,
  });

  const themes = [
    { id: 'light', name: 'Light', icon: Sun, preview: 'bg-white text-black' },
    { id: 'dark', name: 'Dark', icon: Moon, preview: 'bg-zinc-900 text-white' },
    { id: 'system', name: 'System', icon: Laptop, preview: 'bg-gradient-to-r from-white to-zinc-900' },
  ];

  const colors = [
    { id: 'slate', name: 'Slate', value: '#64748b' },
    { id: 'gray', name: 'Gray', value: '#6b7280' },
    { id: 'zinc', name: 'Zinc', value: '#71717a' },
    { id: 'neutral', name: 'Neutral', value: '#737373' },
    { id: 'stone', name: 'Stone', value: '#78716c' },
    { id: 'red', name: 'Red', value: '#ef4444' },
    { id: 'orange', name: 'Orange', value: '#f97316' },
    { id: 'amber', name: 'Amber', value: '#f59e0b' },
    { id: 'yellow', name: 'Yellow', value: '#eab308' },
    { id: 'lime', name: 'Lime', value: '#84cc16' },
    { id: 'green', name: 'Green', value: '#10b981' },
    { id: 'emerald', name: 'Emerald', value: '#10b981' },
    { id: 'teal', name: 'Teal', value: '#14b8a6' },
    { id: 'cyan', name: 'Cyan', value: '#06b6d4' },
    { id: 'sky', name: 'Sky', value: '#0ea5e9' },
    { id: 'blue', name: 'Blue', value: '#3b82f6' },
    { id: 'indigo', name: 'Indigo', value: '#6366f1' },
    { id: 'violet', name: 'Violet', value: '#8b5cf6' },
    { id: 'purple', name: 'Purple', value: '#a855f7' },
    { id: 'fuchsia', name: 'Fuchsia', value: '#d946ef' },
    { id: 'pink', name: 'Pink', value: '#ec4899' },
    { id: 'rose', name: 'Rose', value: '#f43f5e' },
  ];

  const fontSizes = [
    { id: 'small', name: 'Small', value: '0.875rem' },
    { id: 'medium', name: 'Medium', value: '1rem' },
    { id: 'large', name: 'Large', value: '1.125rem' },
    { id: 'xlarge', name: 'Extra Large', value: '1.25rem' },
  ];

  const fonts = [
    { id: 'inter', name: 'Inter', value: 'Inter' },
    { id: 'roboto', name: 'Roboto', value: 'Roboto' },
    { id: 'poppins', name: 'Poppins', value: 'Poppins' },
    { id: 'opensans', name: 'Open Sans', value: 'Open Sans' },
    { id: 'lato', name: 'Lato', value: 'Lato' },
    { id: 'montserrat', name: 'Montserrat', value: 'Montserrat' },
  ];

  const borderRadiuses = [
    { id: 'none', name: 'None', value: '0' },
    { id: 'small', name: 'Small', value: '0.25rem' },
    { id: 'medium', name: 'Medium', value: '0.5rem' },
    { id: 'large', name: 'Large', value: '0.75rem' },
    { id: 'xlarge', name: 'Extra Large', value: '1rem' },
    { id: 'full', name: 'Full', value: '9999px' },
  ];

  const densities = [
    { id: 'compact', name: 'Compact', icon: Minimize2 },
    { id: 'comfortable', name: 'Comfortable', icon: Layout },
    { id: 'spacious', name: 'Spacious', icon: Maximize2 },
  ];

  const handleSave = () => {
    // In a real app, you'd save to backend
    toast.success('Appearance settings saved');
  };

  const handleReset = () => {
    setSettings({
      theme: 'dark',
      primaryColor: '#6366f1',
      accentColor: '#8b5cf6',
      fontSize: 'medium',
      fontFamily: 'inter',
      borderRadius: 'medium',
      animations: true,
      reducedMotion: false,
      highContrast: false,
      compactMode: false,
      sidebarCollapsed: false,
      showLabels: true,
      showIcons: true,
      density: 'comfortable',
      glassEffect: true,
      blurIntensity: 10,
      transparency: true,
    });
    toast.success('Settings reset to default');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-primary">Appearance</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Customize the look and feel of your workspace
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset} className="border-zinc-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-indigo-500 to-purple-500">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      <Card className="bg-slate-900/50 border-indigo-500/20 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">Live Preview</p>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="theme" className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-indigo-500/20">
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="animations">Animations</TabsTrigger>
        </TabsList>

        {/* Theme Tab */}
        <TabsContent value="theme" className="space-y-4">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Theme Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {themes.map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSettings({ ...settings, theme: theme.id })}
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all',
                        settings.theme === theme.id
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-indigo-500/20 hover:border-indigo-500/30'
                      )}
                    >
                      <div className={cn('h-20 rounded-lg mb-3', theme.preview)} />
                      <div className="flex items-center justify-center gap-2">
                        <Icon className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-white">{theme.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Glass Effect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Enable Glass Morphism</p>
                  <p className="text-xs text-zinc-400">Add blur effects to cards</p>
                </div>
                <Switch
                  checked={settings.glassEffect}
                  onCheckedChange={(checked) => setSettings({ ...settings, glassEffect: checked })}
                />
              </div>

              {settings.glassEffect && (
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Blur Intensity</label>
                  <Slider
                    value={[settings.blurIntensity]}
                    onValueChange={([value]) => setSettings({ ...settings, blurIntensity: value })}
                    max={20}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-zinc-400 mt-1">
                    <span>Light</span>
                    <span>{settings.blurIntensity}px</span>
                    <span>Heavy</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Transparency</p>
                  <p className="text-xs text-zinc-400">Enable transparent elements</p>
                </div>
                <Switch
                  checked={settings.transparency}
                  onCheckedChange={(checked) => setSettings({ ...settings, transparency: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Primary Color</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 lg:grid-cols-7 gap-3">
                {colors.slice(0, 14).map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSettings({ ...settings, primaryColor: color.value })}
                    className="relative group"
                  >
                    <div
                      className="w-full aspect-square rounded-lg transition-transform group-hover:scale-110"
                      style={{ backgroundColor: color.value }}
                    />
                    {settings.primaryColor === color.value && (
                      <Check className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-indigo-500/20 mt-4">
            <CardHeader>
              <CardTitle className="text-white">Accent Color</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 lg:grid-cols-7 gap-3">
                {colors.slice(7).map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSettings({ ...settings, accentColor: color.value })}
                    className="relative group"
                  >
                    <div
                      className="w-full aspect-square rounded-lg transition-transform group-hover:scale-110"
                      style={{ backgroundColor: color.value }}
                    />
                    {settings.accentColor === color.value && (
                      <Check className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-indigo-500/20 mt-4">
            <CardHeader>
              <CardTitle className="text-white">Accessibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">High Contrast</p>
                  <p className="text-xs text-zinc-400">Increase contrast for better visibility</p>
                </div>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => setSettings({ ...settings, highContrast: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-4">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Font Family</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {fonts.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setSettings({ ...settings, fontFamily: font.id })}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      settings.fontFamily === font.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-indigo-500/20 hover:border-indigo-500/30'
                    )}
                  >
                    <p className="text-sm text-white" style={{ fontFamily: font.value }}>
                      {font.name}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">The quick brown fox jumps over the lazy dog</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Font Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {fontSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSettings({ ...settings, fontSize: size.id })}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      settings.fontSize === size.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-indigo-500/20 hover:border-indigo-500/30'
                    )}
                  >
                    <p className="text-white" style={{ fontSize: size.value }}>Aa</p>
                    <p className="text-xs text-zinc-400 mt-1">{size.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Border Radius</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                {borderRadiuses.map((radius) => (
                  <button
                    key={radius.id}
                    onClick={() => setSettings({ ...settings, borderRadius: radius.id })}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      settings.borderRadius === radius.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-indigo-500/20 hover:border-indigo-500/30'
                    )}
                  >
                    <div
                      className="w-full h-8 bg-indigo-500/20 mb-2"
                      style={{ borderRadius: radius.value }}
                    />
                    <p className="text-xs text-white">{radius.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-4">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Density</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {densities.map((density) => {
                  const Icon = density.icon;
                  return (
                    <button
                      key={density.id}
                      onClick={() => setSettings({ ...settings, density: density.id })}
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all',
                        settings.density === density.id
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-indigo-500/20 hover:border-indigo-500/30'
                      )}
                    >
                      <Icon className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                      <p className="text-sm text-white capitalize">{density.name}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Sidebar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Collapse Sidebar</p>
                  <p className="text-xs text-zinc-400">Start with sidebar collapsed</p>
                </div>
                <Switch
                  checked={settings.sidebarCollapsed}
                  onCheckedChange={(checked) => setSettings({ ...settings, sidebarCollapsed: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Show Labels</p>
                  <p className="text-xs text-zinc-400">Display navigation labels</p>
                </div>
                <Switch
                  checked={settings.showLabels}
                  onCheckedChange={(checked) => setSettings({ ...settings, showLabels: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Show Icons</p>
                  <p className="text-xs text-zinc-400">Display navigation icons</p>
                </div>
                <Switch
                  checked={settings.showIcons}
                  onCheckedChange={(checked) => setSettings({ ...settings, showIcons: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Animations Tab */}
        <TabsContent value="animations">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Animation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Enable Animations</p>
                  <p className="text-xs text-zinc-400">Smooth transitions and effects</p>
                </div>
                <Switch
                  checked={settings.animations}
                  onCheckedChange={(checked) => setSettings({ ...settings, animations: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Reduced Motion</p>
                  <p className="text-xs text-zinc-400">Minimize animations for accessibility</p>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => setSettings({ ...settings, reducedMotion: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}