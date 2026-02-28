// app/settings/team/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  UserMinus,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Crown,
  Star,
  Award,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
  Ban,
  Key,
  LogOut,
  Settings,
  UserCog,
  Github,
  Twitter,
  Linkedin,
  MessageSquare,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// Mock team members data
const mockTeamMembers = [
  {
    id: 'user-1',
    name: 'John Smith',
    email: 'john.smith@axr.io',
    role: 'admin',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=1',
    lastActive: '2024-01-20T15:30:00Z',
    joinedAt: '2023-01-15T10:00:00Z',
    department: 'Engineering',
    title: 'Lead Engineer',
    permissions: ['all'],
    twoFactorEnabled: true,
    loginMethod: 'google',
    activity: {
      tasksCompleted: 1234,
      successRate: 98,
      avgResponseTime: 234,
    },
  },
  {
    id: 'user-2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@axr.io',
    role: 'member',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=2',
    lastActive: '2024-01-20T14:20:00Z',
    joinedAt: '2023-03-10T09:30:00Z',
    department: 'Product',
    title: 'Product Manager',
    permissions: ['read', 'write'],
    twoFactorEnabled: true,
    loginMethod: 'email',
    activity: {
      tasksCompleted: 567,
      successRate: 95,
      avgResponseTime: 312,
    },
  },
  {
    id: 'user-3',
    name: 'Mike Chen',
    email: 'mike.chen@axr.io',
    role: 'member',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=3',
    lastActive: '2024-01-20T13:45:00Z',
    joinedAt: '2023-06-20T14:15:00Z',
    department: 'Engineering',
    title: 'Senior Developer',
    permissions: ['read', 'write', 'delete'],
    twoFactorEnabled: false,
    loginMethod: 'github',
    activity: {
      tasksCompleted: 890,
      successRate: 96,
      avgResponseTime: 187,
    },
  },
  {
    id: 'user-4',
    name: 'Emily Davis',
    email: 'emily.davis@axr.io',
    role: 'viewer',
    status: 'away',
    avatar: 'https://i.pravatar.cc/150?u=4',
    lastActive: '2024-01-19T16:10:00Z',
    joinedAt: '2023-09-05T11:20:00Z',
    department: 'Marketing',
    title: 'Marketing Specialist',
    permissions: ['read'],
    twoFactorEnabled: true,
    loginMethod: 'email',
    activity: {
      tasksCompleted: 234,
      successRate: 92,
      avgResponseTime: 456,
    },
  },
  {
    id: 'user-5',
    name: 'Alex Wilson',
    email: 'alex.wilson@axr.io',
    role: 'member',
    status: 'offline',
    avatar: 'https://i.pravatar.cc/150?u=5',
    lastActive: '2024-01-18T09:30:00Z',
    joinedAt: '2023-11-12T13:40:00Z',
    department: 'Engineering',
    title: 'DevOps Engineer',
    permissions: ['read', 'write'],
    twoFactorEnabled: true,
    loginMethod: 'google',
    activity: {
      tasksCompleted: 456,
      successRate: 94,
      avgResponseTime: 267,
    },
  },
];

const mockInvitations = [
  {
    id: 'inv-1',
    email: 'new.hire@example.com',
    role: 'member',
    invitedBy: 'john.smith@axr.io',
    invitedAt: '2024-01-19T10:30:00Z',
    expiresAt: '2024-01-26T10:30:00Z',
    status: 'pending',
  },
  {
    id: 'inv-2',
    email: 'contractor@example.com',
    role: 'viewer',
    invitedBy: 'sarah.johnson@axr.io',
    invitedAt: '2024-01-18T14:20:00Z',
    expiresAt: '2024-01-25T14:20:00Z',
    status: 'pending',
  },
];

const roles = [
  {
    id: 'admin',
    name: 'Admin',
    icon: Crown,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    description: 'Full access to all resources and settings',
    members: 1,
    permissions: ['all'],
  },
  {
    id: 'member',
    name: 'Member',
    icon: Star,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    description: 'Can create and manage workflows',
    members: 3,
    permissions: ['read', 'write', 'delete'],
  },
  {
    id: 'viewer',
    name: 'Viewer',
    icon: Shield,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    description: 'Read-only access',
    members: 1,
    permissions: ['read'],
  },
];

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [invitations, setInvitations] = useState(mockInvitations);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member',
    message: '',
  });

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) ||
                         member.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || member.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.status === 'active').length,
    away: teamMembers.filter(m => m.status === 'away').length,
    offline: teamMembers.filter(m => m.status === 'offline').length,
    pending: invitations.length,
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'text-emerald-400 bg-emerald-500/10';
      case 'away': return 'text-amber-400 bg-amber-500/10';
      case 'offline': return 'text-zinc-400 bg-zinc-500/10';
      default: return 'text-zinc-400 bg-zinc-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active': return CheckCircle;
      case 'away': return Clock;
      case 'offline': return XCircle;
      default: return AlertCircle;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleInvite = () => {
    if (!inviteForm.email) {
      toast.error('Please enter an email address');
      return;
    }
    if (!inviteForm.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    const newInvite = {
      id: `inv-${Date.now()}`,
      email: inviteForm.email,
      role: inviteForm.role,
      invitedBy: 'admin@axr.io',
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
    };

    setInvitations([newInvite, ...invitations]);
    setShowInviteForm(false);
    setInviteForm({ email: '', role: 'member', message: '' });
    toast.success(`Invitation sent to ${inviteForm.email}`);
  };

  const handleResendInvite = (id: string) => {
    toast.success('Invitation resent');
  };

  const handleCancelInvite = (id: string) => {
    if (confirm('Are you sure you want to cancel this invitation?')) {
      setInvitations(invitations.filter(i => i.id !== id));
      toast.success('Invitation cancelled');
    }
  };

  const handleRemoveMember = (id: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(teamMembers.filter(m => m.id !== id));
      toast.success('Team member removed');
    }
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    setTeamMembers(prev =>
      prev.map(m =>
        m.id === memberId
          ? { ...m, role: newRole }
          : m
      )
    );
    toast.success('Role updated');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-primary">Team Management</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage team members, roles, and permissions
          </p>
        </div>

        <Button
          onClick={() => setShowInviteForm(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-500"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs text-zinc-400">Total Members</p>
                <p className="text-lg font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs text-zinc-400">Active</p>
                <p className="text-lg font-bold text-emerald-400">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs text-zinc-400">Away</p>
                <p className="text-lg font-bold text-amber-400">{stats.away}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-zinc-400" />
              <div>
                <p className="text-xs text-zinc-400">Offline</p>
                <p className="text-lg font-bold text-zinc-400">{stats.offline}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs text-zinc-400">Pending</p>
                <p className="text-lg font-bold text-purple-400">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-indigo-500/20">
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search members by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-4 bg-slate-900/50 border-indigo-500/20"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all">All Members</option>
              <option value="active">Active</option>
              <option value="away">Away</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Members List */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {filteredMembers.map((member) => {
              const StatusIcon = getStatusIcon(member.status);
              const RoleIcon = roles.find(r => r.id === member.role)?.icon || Shield;

              return (
                <motion.div key={member.id} variants={item}>
                  <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <Avatar className="h-12 w-12 border-2 border-indigo-500/30">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Member Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium text-white">{member.name}</h3>
                            <Badge className={getStatusColor(member.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {member.status}
                            </Badge>
                            <Badge variant="outline" className="border-indigo-500/30">
                              <RoleIcon className="w-3 h-3 mr-1 text-indigo-400" />
                              {member.role}
                            </Badge>
                          </div>

                          <p className="text-sm text-zinc-400">{member.email}</p>

                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-zinc-500">Department</p>
                              <p className="text-sm text-white">{member.department}</p>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500">Title</p>
                              <p className="text-sm text-white">{member.title}</p>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500">Last Active</p>
                              <p className="text-sm text-white">
                                {formatDate(member.lastActive).split(',')[0]}
                              </p>
                            </div>
                          </div>

                          {/* Activity Stats */}
                          <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-indigo-500/20">
                            <div>
                              <p className="text-xs text-zinc-500">Tasks</p>
                              <p className="text-lg font-semibold text-white">
                                {member.activity.tasksCompleted}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500">Success Rate</p>
                              <p className="text-lg font-semibold text-emerald-400">
                                {member.activity.successRate}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500">Avg Response</p>
                              <p className="text-lg font-semibold text-amber-400">
                                {member.activity.avgResponseTime}ms
                              </p>
                            </div>
                          </div>

                          {/* Security Badges */}
                          <div className="flex items-center gap-2 mt-2">
                            {member.twoFactorEnabled && (
                              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                2FA Enabled
                              </Badge>
                            )}
                            <Badge variant="outline" className="border-indigo-500/30">
                              <Key className="w-3 h-3 mr-1" />
                              {member.loginMethod}
                            </Badge>
                          </div>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors">
                              <MoreVertical className="w-4 h-4 text-zinc-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-900 border-indigo-500/20">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSelectedMember(member)}>
                              <UserCog className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Shield className="w-4 h-4 mr-2" />
                              Manage Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Key className="w-4 h-4 mr-2" />
                              Reset 2FA
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-rose-400"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles">
          <div className="grid lg:grid-cols-3 gap-4">
            {roles.map((role) => {
              const Icon = role.icon;
              const memberCount = teamMembers.filter(m => m.role === role.id).length;

              return (
                <Card key={role.id} className="bg-slate-900/50 border-indigo-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn('p-2 rounded-lg', role.bgColor)}>
                        <Icon className={cn('w-5 h-5', role.color)} />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{role.name}</h3>
                        <p className="text-xs text-zinc-400">{memberCount} members</p>
                      </div>
                    </div>

                    <p className="text-sm text-zinc-300 mb-4">{role.description}</p>

                    <div className="space-y-2">
                      <p className="text-xs text-zinc-400">Permissions:</p>
                      {role.permissions.map((perm) => (
                        <div key={perm} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span className="text-white capitalize">{perm}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4 border-indigo-500/30 text-indigo-400"
                    >
                      Manage Role
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardContent className="p-6">
              {invitations.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400">No pending invitations</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-indigo-500/10">
                          <Mail className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{invite.email}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                            <span>Role: {invite.role}</span>
                            <span>•</span>
                            <span>Invited by: {invite.invitedBy}</span>
                            <span>•</span>
                            <span>Expires: {formatDate(invite.expiresAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="warning">Pending</Badge>
                        <button
                          onClick={() => handleResendInvite(invite.id)}
                          className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4 text-indigo-400" />
                        </button>
                        <button
                          onClick={() => handleCancelInvite(invite.id)}
                          className="p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg"
                  >
                    <div className="p-2 rounded-lg bg-indigo-500/10">
                      <Activity className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        John Smith updated workflow permissions
                      </p>
                      <p className="text-xs text-zinc-400">2 hours ago</p>
                    </div>
                    <Badge variant="outline" className="border-indigo-500/30">
                      Workflow
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowInviteForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-slate-900 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Invite Team Member</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Email Address</label>
                    <Input
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      placeholder="colleague@company.com"
                      className="bg-slate-900 border-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Role</label>
                    <select
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Personal Message (optional)</label>
                    <textarea
                      value={inviteForm.message}
                      onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                      placeholder="Add a personal note..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleInvite}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                    >
                      Send Invitation
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowInviteForm(false)}
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

      {/* Member Profile Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-slate-900 border-indigo-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <Avatar className="h-16 w-16 border-2 border-indigo-500/30">
                      <AvatarImage src={selectedMember.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-lg">
                        {getInitials(selectedMember.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white">{selectedMember.name}</h2>
                      <p className="text-sm text-zinc-400">{selectedMember.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(selectedMember.status)}>
                          {selectedMember.status}
                        </Badge>
                        <Badge variant="outline" className="border-indigo-500/30">
                          {selectedMember.role}
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMember(null)}
                      className="p-2 rounded-lg hover:bg-indigo-500/10"
                    >
                      <XCircle className="w-5 h-5 text-zinc-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Department</p>
                      <p className="text-sm text-white">{selectedMember.department}</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Title</p>
                      <p className="text-sm text-white">{selectedMember.title}</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Joined</p>
                      <p className="text-sm text-white">{formatDate(selectedMember.joinedAt)}</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Last Active</p>
                      <p className="text-sm text-white">{formatDate(selectedMember.lastActive)}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-white mb-3">Activity Overview</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                        <p className="text-2xl font-bold text-white">{selectedMember.activity.tasksCompleted}</p>
                        <p className="text-xs text-zinc-400">Tasks</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                        <p className="text-2xl font-bold text-emerald-400">{selectedMember.activity.successRate}%</p>
                        <p className="text-xs text-zinc-400">Success</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                        <p className="text-2xl font-bold text-amber-400">{selectedMember.activity.avgResponseTime}ms</p>
                        <p className="text-xs text-zinc-400">Response</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" className="border-indigo-500/30">
                      <Mail className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" className="border-indigo-500/30">
                      <Shield className="w-4 h-4 mr-2" />
                      Permissions
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