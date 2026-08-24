import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { User, Mail, Shield, LogOut, Save, Sparkles, CheckCircle2 } from 'lucide-react';

export const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, setProfile, showToast } = useApp();

  const [name, setName] = useState(profile.name || user?.user_metadata?.name || 'Suranjan');
  const [email] = useState(user?.email || profile.email || 'user@domain.com');
  const [role, setRole] = useState(profile.role || 'Student & Engineer');
  const [peakEnergy, setPeakEnergy] = useState(profile.peakEnergy || '09:00 - 12:00');

  const handleSave = (e) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      name,
      role,
      peakEnergy
    }));
    showToast('Profile updated successfully!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      <PageHeader
        title="User Profile & Account"
        subtitle="Manage your personal identity, focus track, and account session."
        action={
          <Button
            variant="danger"
            size="sm"
            onClick={signOut}
            icon={LogOut}
          >
            Sign Out
          </Button>
        }
      />

      {/* Account Overview Card */}
      <div className="card-panel p-6 border-indigo-500/30 flex items-center gap-4 bg-gradient-to-r from-indigo-950/30 to-zinc-900">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20 shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-100">{name}</h2>
          <span className="text-xs text-zinc-400 font-mono block">{email}</span>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="ai" size="sm">
              <Shield className="w-3 h-3 text-indigo-400" />
              Authenticated Session
            </Badge>
            <span className="text-[10px] text-zinc-500 font-mono">
              ID: {user?.id?.substring(0, 8)}...
            </span>
          </div>
        </div>
      </div>

      {/* Profile Settings Form */}
      <form onSubmit={handleSave} className="card-panel p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
          <User className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-zinc-100">Personal Context Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Email Address (Read-only)
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3.5 py-2.5 bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-sm text-zinc-500 focus:outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Primary Role / Career Focus
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Peak Analytical Energy Hours
            </label>
            <input
              type="text"
              value={peakEnergy}
              onChange={(e) => setPeakEnergy(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <Button variant="ai" size="md" type="submit" icon={Save}>
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
