// app/profile/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  Mail,
  Key,
  Shield,
  Bell,
  Clock,
  Calendar,
  Settings,
  LogOut,
  Edit,
  Camera,
  Github,
  Twitter,
  Linkedin,
  Globe,
  MapPin,
  Briefcase,
  Award,
  Star,
  Activity,
  Download,
  Upload,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  Tablet,
  Globe2,
  Moon,
  Sun,
  Palette,
  Languages,
  Volume2,
  VolumeX,
  Zap,
  Cpu,
  Server,
  Database,
  TrendingUp,
  BarChart3,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  RefreshCw,
  Save,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  ChevronDown,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Mock user data
const mockUser = {
  id: 'user-123',
  name: 'John Smith',
  email: 'john.smith@axr.io',
  username: 'johnsmith',
  bio: 'Lead Engineer at AXR. Passionate about automation and AI.',
  avatar: 'https://i.pravatar.cc/300?u=1',
  role: 'admin',
  department: 'Engineering',
  title: 'Lead Engineer',
  location: 'San Francisco, CA',
  website: 'https://johnsmith.dev',
  github: 'johnsmith',
  twitter: '@johnsmith',
  linkedin: 'johnsmith',
  phone: '+1 (555) 123-4567',
  timezone: 'America/Los_Angeles',
  language: 'en',
  theme: 'dark',
  notifications: {
    email: true,
    desktop: true,
    mobile: false,
    slack: true,
  },
  twoFactorEnabled: true,
  lastLogin: '2024-01-20T15:30:00Z',
  memberSince: '2023-01-15T10:00:00Z',
  accountStatus: 'active',
  emailVerified: true,
};

// Mock activity history
const mockActivityHistory = [
  {
    id: 'act-1',
    type: 'login',
    description: 'Logged in from Chrome on macOS',
    ip: '192.168.1.100',
    location: 'San Francisco, CA',
    device: 'MacBook Pro',
    browser: 'Chrome 120.0',
    timestamp: '2024-01-20T15:30:00Z',
    status: 'success',
  },
  {
    id: 'act-2',
    type: 'settings',
    description: 'Updated notification preferences',
    ip: '192.168.1.100',
    location: 'San Francisco, CA',
    timestamp: '2024-01-19T10:15:00Z',
    status: 'success',
  },
  {
    id: 'act-3',
    type: 'security',
    description: 'Changed password',
    ip: '192.168.1.100',
    location: 'San Francisco, CA',
    timestamp: '2024-01-18T14:20:00Z',
    status: 'success',
  },
  {
    id: 'act-4',
    type: 'api',
    description: 'Created new API key',
    ip: '192.168.1.100',
    location: 'San Francisco, CA',
    timestamp: '2024-01-17T09:45:00Z',
    status: 'success',
  },
  {
    id: 'act-5',
    type: 'login',
    description: 'Failed login attempt',
    ip: '203.0.113.45',
    location: 'Unknown',
    device: 'Unknown',
    timestamp: '2024-01-16T23:10:00Z',
    status: 'failed',
  },
];

// Mock sessions
const mockSessions = [
  {
    id: 'sess-1',
    device: 'MacBook Pro',
    browser: 'Chrome 120.0',
    os: 'macOS 14.2',
    location: 'San Francisco, CA',
    ip: '192.168.1.100',
    current: true,
    lastActive: '2024-01-20T15:30:00Z',
    createdAt: '2024-01-20T09:00:00Z',
  },
  {
    id: 'sess-2',
    device: 'iPhone 15 Pro',
    browser: 'Safari',
    os: 'iOS 17.2',
    location: 'San Francisco, CA',
    ip: '192.168.1.101',
    current: false,
    lastActive: '2024-01-19T22:15:00Z',
    createdAt: '2024-01-19T08:30:00Z',
  },
  {
    id: 'sess-3',
    device: 'Windows PC',
    browser: 'Firefox 121.0',
    os: 'Windows 11',
    location: 'Remote',
    ip: '203.0.113.200',
    current: false,
    lastActive: '2024-01-18T14:20:00Z',
    createdAt: '2024-01-15T11:45:00Z',
  },
];

// Mock API keys
const mockApiKeys = [
  {
    id: 'key-1',
    name: 'Production API Key',
    prefix: 'axr_live_sk_abc123...',
    createdAt: '2024-01-15T10:30:00Z',
    lastUsed: '2024-01-20T15:45:00Z',
    expiresAt: '2025-01-15T10:30:00Z',
    permissions: ['read', 'write'],
  },
  {
    id: 'key-2',
    name: 'Development API Key',
    prefix: 'axr_dev_sk_xyz789...',
    createdAt: '2024-01-10T08:20:00Z',
    lastUsed: '2024-01-19T09:30:00Z',
    expiresAt: '2024-07-10T08:20:00Z',
    permissions: ['read'],
  },
];

// Mock connected accounts
const mockConnectedAccounts = [
  {
    id: 'github',
    name: 'GitHub',
    username: 'johnsmith',
    connected: true,
    icon: Github,
    color: 'text-zinc-400',
  },
  {
    id: 'twitter',
    name: 'Twitter',
    username: '@johnsmith',
    connected: true,
    icon: Twitter,
    color: 'text-sky-400',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    username: 'johnsmith',
    connected: true,
    icon: Linkedin,
    color: 'text-blue-400',
  },
  {
    id: 'google',
    name: 'Google',
    username: 'john.smith@gmail.com',
    connected: false,
    icon: Globe,
    color: 'text-emerald-400',
  },
];

export default function ProfilePage() {
  const [user, setUser] = useState(mockUser);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
    username: user.username,
    bio: user.bio,
    phone: user.phone,
    location: user.location,
    website: user.website,
    github: user.github,
    twitter: user.twitter,
    linkedin: user.linkedin,
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [notificationSettings, setNotificationSettings] = useState(user.notifications);

  const handleSaveProfile = () => {
    setUser({ ...user, ...profileForm });
    setEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleChangePassword = () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('Please fill in all fields');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password changed successfully');
    setShowPasswordForm(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const handleDeleteAccount = () => {
    toast.success('Account deletion request submitted');
    setShowDeleteConfirm(false);
  };

  const handleRevokeSession = (sessionId: string) => {
    toast.success('Session revoked');
  };

  const handleRevokeAllSessions = () => {
    if (confirm('Are you sure you want to revoke all other sessions?')) {
      toast.success('All other sessions revoked');
    }
  };

  const handleDisconnectAccount = (accountId: string) => {
    toast.success(`Disconnected from ${accountId}`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'login': return User;
      case 'settings': return Settings;
      case 'security': return Shield;
      case 'api': return Key;
      default: return Activity;
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">
              <span className="gradient-text-primary">Profile</span>
            </h1>
            <p className="text-zinc-400 mt-1 text-sm lg:text-base">
              Manage your account settings and preferences
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setEditing(!editing)}
            className="border-indigo-500/30 text-indigo-400"
          >
            {editing ? (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        {/* Profile Overview Card */}
        <Card className="bg-slate-900/50 border-indigo-500/20 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="w-24 h-24 border-2 border-indigo-500/30">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-2xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {editing && (
                  <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-500 hover:bg-indigo-600 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                  <Badge variant="success">Active</Badge>
                  {user.twoFactorEnabled && (
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                      <Shield className="w-3 h-3 mr-1" />
                      2FA Enabled
                    </Badge>
                  )}
                </div>
                <p className="text-zinc-400 mb-4">{user.bio}</p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500">Email</p>
                    <p className="text-sm text-white">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Role</p>
                    <p className="text-sm text-white capitalize">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Department</p>
                    <p className="text-sm text-white">{user.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Location</p>
                    <p className="text-sm text-white">{user.location}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">234</p>
                  <p className="text-xs text-zinc-400">Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">98%</p>
                  <p className="text-xs text-zinc-400">Success</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">12</p>
                  <p className="text-xs text-zinc-400">Projects</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-slate-900/50 border border-indigo-500/20">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="connected">Connected</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid lg:grid-cols-2 gap-6"
            >
              {/* Personal Information */}
              <Card className="bg-slate-900/50 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Full Name</label>
                    {editing ? (
                      <Input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="bg-slate-900 border-indigo-500/20"
                      />
                    ) : (
                      <p className="text-white">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Email</label>
                    {editing ? (
                      <Input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="bg-slate-900 border-indigo-500/20"
                      />
                    ) : (
                      <p className="text-white">{user.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Username</label>
                    {editing ? (
                      <Input
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                        className="bg-slate-900 border-indigo-500/20"
                      />
                    ) : (
                      <p className="text-white">@{user.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Bio</label>
                    {editing ? (
                      <Textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        rows={3}
                        className="bg-slate-900 border-indigo-500/20"
                      />
                    ) : (
                      <p className="text-white">{user.bio}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Phone</label>
                    {editing ? (
                      <Input
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="bg-slate-900 border-indigo-500/20"
                      />
                    ) : (
                      <p className="text-white">{user.phone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location & Contact */}
              <Card className="bg-slate-900/50 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Location & Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Location</label>
                    {editing ? (
                      <Input
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        className="bg-slate-900 border-indigo-500/20"
                      />
                    ) : (
                      <p className="text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-zinc-400" />
                        {user.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Website</label>
                    {editing ? (
                      <Input
                        value={profileForm.website}
                        onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                        className="bg-slate-900 border-indigo-500/20"
                      />
                    ) : (
                      <p className="text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-zinc-400" />
                        {user.website}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Timezone</label>
                    <p className="text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      {user.timezone}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Member Since</label>
                    <p className="text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      {formatDate(user.memberSince)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="bg-slate-900/50 border-indigo-500/20 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Social Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-zinc-400 mb-1 block">GitHub</label>
                      {editing ? (
                        <Input
                          value={profileForm.github}
                          onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                          placeholder="username"
                          className="bg-slate-900 border-indigo-500/20"
                        />
                      ) : (
                        <p className="text-white flex items-center gap-2">
                          <Github className="w-4 h-4 text-zinc-400" />
                          {user.github}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-zinc-400 mb-1 block">Twitter</label>
                      {editing ? (
                        <Input
                          value={profileForm.twitter}
                          onChange={(e) => setProfileForm({ ...profileForm, twitter: e.target.value })}
                          placeholder="@username"
                          className="bg-slate-900 border-indigo-500/20"
                        />
                      ) : (
                        <p className="text-white flex items-center gap-2">
                          <Twitter className="w-4 h-4 text-sky-400" />
                          {user.twitter}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-zinc-400 mb-1 block">LinkedIn</label>
                      {editing ? (
                        <Input
                          value={profileForm.linkedin}
                          onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                          placeholder="username"
                          className="bg-slate-900 border-indigo-500/20"
                        />
                      ) : (
                        <p className="text-white flex items-center gap-2">
                          <Linkedin className="w-4 h-4 text-blue-400" />
                          {user.linkedin}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              {editing && (
                <div className="lg:col-span-2 flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid lg:grid-cols-2 gap-6"
            >
              {/* Password */}
              <Card className="bg-slate-900/50 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Password</CardTitle>
                </CardHeader>
                <CardContent>
                  {!showPasswordForm ? (
                    <div>
                      <p className="text-sm text-zinc-400 mb-4">
                        Last changed 30 days ago
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setShowPasswordForm(true)}
                        className="border-indigo-500/30 text-indigo-400"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-zinc-400 mb-1 block">Current Password</label>
                        <Input
                          type="password"
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                          className="bg-slate-900 border-indigo-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-zinc-400 mb-1 block">New Password</label>
                        <Input
                          type="password"
                          value={passwordForm.new}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                          className="bg-slate-900 border-indigo-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-zinc-400 mb-1 block">Confirm New Password</label>
                        <Input
                          type="password"
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                          className="bg-slate-900 border-indigo-500/20"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleChangePassword}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500"
                        >
                          Update Password
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowPasswordForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <Card className="bg-slate-900/50 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-white">Status</p>
                      <p className="text-xs text-zinc-400">
                        {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <Switch
                      checked={user.twoFactorEnabled}
                      onCheckedChange={() => setUser({ ...user, twoFactorEnabled: !user.twoFactorEnabled })}
                    />
                  </div>
                  {user.twoFactorEnabled && (
                    <Button
                      variant="outline"
                      onClick={() => setShow2FA(true)}
                      className="w-full border-indigo-500/30 text-indigo-400"
                    >
                      Configure 2FA
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Active Sessions */}
              <Card className="bg-slate-900/50 border-indigo-500/20 lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Active Sessions</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRevokeAllSessions}
                      className="border-rose-500/30 text-rose-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Revoke All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          {session.device.includes('Mac') ? (
                            <Laptop className="w-5 h-5 text-indigo-400" />
                          ) : session.device.includes('iPhone') ? (
                            <Smartphone className="w-5 h-5 text-indigo-400" />
                          ) : (
                            <Laptop className="w-5 h-5 text-indigo-400" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white">
                                {session.device}
                              </p>
                              {session.current && (
                                <Badge variant="success" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400">
                              {session.browser} • {session.os}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {session.location} • {session.ip}
                            </p>
                            <p className="text-xs text-zinc-500">
                              Last active: {formatDate(session.lastActive)}
                            </p>
                          </div>
                        </div>
                        {!session.current && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeSession(session.id)}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Delete Account */}
              <Card className="bg-slate-900/50 border-rose-500/20">
                <CardHeader>
                  <CardTitle className="text-rose-400">Delete Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Email Notifications</p>
                    <p className="text-xs text-zinc-400">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.email}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, email: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Desktop Notifications</p>
                    <p className="text-xs text-zinc-400">Show browser notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.desktop}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, desktop: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Mobile Push</p>
                    <p className="text-xs text-zinc-400">Send push notifications to your device</p>
                  </div>
                  <Switch
                    checked={notificationSettings.mobile}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, mobile: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Slack Integration</p>
                    <p className="text-xs text-zinc-400">Send alerts to Slack</p>
                  </div>
                  <Switch
                    checked={notificationSettings.slack}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, slack: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Activity History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivityHistory.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg"
                      >
                        <div className={cn(
                          'p-2 rounded-lg',
                          activity.status === 'success' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                        )}>
                          <Icon className={cn(
                            'w-4 h-4',
                            activity.status === 'success' ? 'text-emerald-400' : 'text-rose-400'
                          )} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">{activity.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                            <span>{activity.location}</span>
                            <span>•</span>
                            <span>{activity.ip}</span>
                            <span>•</span>
                            <span>{formatDate(activity.timestamp)}</span>
                          </div>
                        </div>
                        <Badge variant={activity.status === 'success' ? 'success' : 'destructive'}>
                          {activity.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys">
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">API Keys</CardTitle>
                  <Button
                    variant="outline"
                    className="border-indigo-500/30 text-indigo-400"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockApiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <Key className="w-5 h-5 text-indigo-400" />
                        <div>
                          <p className="text-sm font-medium text-white">{key.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                            <span className="font-mono">
                              {showApiKey === key.id ? 'sk_live_abc123def456...' : key.prefix}
                            </span>
                            <button
                              onClick={() => setShowApiKey(showApiKey === key.id ? null : key.id)}
                              className="text-indigo-400 hover:text-indigo-300"
                            >
                              {showApiKey === key.id ? 'Hide' : 'Show'}
                            </button>
                            <span>•</span>
                            <span>Created {formatDate(key.createdAt)}</span>
                            <span>•</span>
                            <span>Expires {formatDate(key.expiresAt)}</span>
                          </div>
                          <div className="flex gap-1 mt-1">
                            {key.permissions.map((perm) => (
                              <Badge key={perm} variant="outline" className="border-indigo-500/30">
                                {perm}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded hover:bg-indigo-500/10">
                          <Copy className="w-4 h-4 text-indigo-400" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-rose-500/10">
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connected Accounts Tab */}
          <TabsContent value="connected">
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Connected Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockConnectedAccounts.map((account) => {
                    const Icon = account.icon;
                    return (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={cn('w-5 h-5', account.color)} />
                          <div>
                            <p className="text-sm font-medium text-white">{account.name}</p>
                            <p className="text-xs text-zinc-400">{account.username}</p>
                          </div>
                        </div>
                        {account.connected ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnectAccount(account.id)}
                            className="border-rose-500/30 text-rose-400"
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-indigo-500/30 text-indigo-400"
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-slate-900 border-rose-500/20">
                <CardHeader>
                  <CardTitle className="text-rose-400">Delete Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-zinc-400">
                    Are you absolutely sure you want to delete your account? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="flex-1"
                    >
                      Yes, Delete Account
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}