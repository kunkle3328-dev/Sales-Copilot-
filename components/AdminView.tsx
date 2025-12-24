import React, { useState } from 'react';
import { AppConfig, User, PlaybookEntry } from '../types';
import { Shield, Activity, Zap, Brain, Settings, Lock, Edit2, Trash2, Plus, Save, X, MoreHorizontal, Sliders, CheckSquare, Square } from 'lucide-react';
import { clsx } from 'clsx';

interface AdminViewProps {
  config: AppConfig;
  onConfigChange: (newConfig: AppConfig) => void;
}

// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  {
    id: 'u1', name: 'Admin User', email: 'admin@salescopilot.ai', role: 'Owner', status: 'Active', lastActive: 'Now',
    permissions: { canExportData: true, canEditPlaybooks: true, canSeeTeamAnalytics: true, canManageUsers: true }
  },
  {
    id: 'u2', name: 'Sarah Miller', email: 'sarah@sales.com', role: 'Seller', status: 'Active', lastActive: '2h ago',
    permissions: { canExportData: false, canEditPlaybooks: false, canSeeTeamAnalytics: false, canManageUsers: false }
  },
  {
    id: 'u3', name: 'Jason Smith', email: 'jason@sales.com', role: 'Manager', status: 'Active', lastActive: '5h ago',
    permissions: { canExportData: true, canEditPlaybooks: true, canSeeTeamAnalytics: true, canManageUsers: false }
  },
];

const MOCK_PLAYBOOKS: PlaybookEntry[] = [
  { id: 'pb1', name: 'Pricing Pushback', trigger: 'Too expensive', responseStrategy: 'Pivot to ROI and value over cost.', isActive: true },
  { id: 'pb2', name: 'Competitor Mention', trigger: 'Competitor X is cheaper', responseStrategy: 'Highlight our superior support and integration speed.', isActive: true },
];

const Toggle = ({ label, description, checked, onChange, icon: Icon }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-medium text-slate-200">{label}</h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={clsx(
        "w-12 h-6 rounded-full transition-colors relative shrink-0",
        checked ? "bg-primary-600" : "bg-slate-700"
      )}
    >
      <div className={clsx(
        "w-4 h-4 rounded-full bg-white absolute top-1 transition-transform",
        checked ? "left-7" : "left-1"
      )} />
    </button>
  </div>
);

const UserEditModal = ({ user, onClose, onSave }: { user: User, onClose: () => void, onSave: (u: User) => void }) => {
    const [editedUser, setEditedUser] = useState(user);

    const togglePermission = (key: keyof User['permissions']) => {
        setEditedUser(prev => ({
            ...prev,
            permissions: { ...prev.permissions, [key]: !prev.permissions[key] }
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Edit Permissions</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">User Role</label>
                        <select 
                            value={editedUser.role}
                            onChange={(e) => setEditedUser({...editedUser, role: e.target.value as any})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        >
                            <option value="Seller">Seller</option>
                            <option value="Manager">Manager</option>
                            <option value="Admin">Admin</option>
                            <option value="Owner">Owner</option>
                        </select>
                    </div>

                    <div>
                         <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Granular Permissions</label>
                         <div className="space-y-3">
                            {[
                                { k: 'canExportData', l: 'Export Data' },
                                { k: 'canEditPlaybooks', l: 'Edit Playbooks' },
                                { k: 'canSeeTeamAnalytics', l: 'View Team Analytics' },
                                { k: 'canManageUsers', l: 'Manage Users' }
                            ].map((perm) => (
                                <div key={perm.k} 
                                    className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors"
                                    onClick={() => togglePermission(perm.k as keyof User['permissions'])}
                                >
                                    <span className="text-slate-300 text-sm font-medium">{perm.l}</span>
                                    {editedUser.permissions[perm.k as keyof User['permissions']] ? (
                                        <CheckSquare className="text-primary-500" size={20} />
                                    ) : (
                                        <Square className="text-slate-600" size={20} />
                                    )}
                                </div>
                            ))}
                         </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                    <button onClick={() => onSave(editedUser)} className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors">Save Changes</button>
                </div>
            </div>
        </div>
    );
}

const AdminView: React.FC<AdminViewProps> = ({ config, onConfigChange }) => {
  const [activeTab, setActiveTab] = useState<'system' | 'users' | 'playbooks'>('system');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [playbooks, setPlaybooks] = useState<PlaybookEntry[]>(MOCK_PLAYBOOKS);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const updateConfig = (key: keyof AppConfig, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };

  const updateSystemLimit = (key: keyof AppConfig['systemLimits'], value: any) => {
    onConfigChange({
        ...config,
        systemLimits: { ...config.systemLimits, [key]: value }
    });
  };

  const handleSaveUser = (updatedUser: User) => {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      setEditingUser(null);
  };

  const handleDeletePlaybook = (id: string) => {
      setPlaybooks(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-2xl font-bold text-white flex items-center gap-3">
             <Shield className="text-primary-500" />
             Admin Control System
           </h1>
           <p className="text-slate-400 mt-2">Operator-grade controls for revenue protection and feature gating.</p>
        </div>
        <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-mono font-medium flex items-center gap-2 self-start md:self-auto">
            <Lock size={12} />
            ADMIN MODE ACTIVE
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 mb-8 overflow-x-auto">
          {['system', 'users', 'playbooks'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={clsx(
                    "px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap",
                    activeTab === tab ? "border-primary-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"
                )}
              >
                  {tab === 'system' ? 'System Controls' : tab === 'users' ? 'User Management' : 'Playbooks'}
              </button>
          ))}
      </div>

      {/* --- SYSTEM CONTROLS --- */}
      {activeTab === 'system' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            {/* Global Feature Toggles */}
            <section className="space-y-4">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Zap size={16} /> Global Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Toggle 
                    label="Live Suggestions" 
                    description="Real-time coaching during calls."
                    checked={config.enableLiveSuggestions}
                    onChange={(v: boolean) => updateConfig('enableLiveSuggestions', v)}
                    icon={Zap}
                />
                <Toggle 
                    label="Objection Detection" 
                    description="Identify pricing, timing, and trust issues."
                    checked={config.enableObjectionDetection}
                    onChange={(v: boolean) => updateConfig('enableObjectionDetection', v)}
                    icon={Shield}
                />
                <Toggle 
                    label="Buying Signals" 
                    description="Alerts when prospect shows intent."
                    checked={config.enableBuyingSignals}
                    onChange={(v: boolean) => updateConfig('enableBuyingSignals', v)}
                    icon={Activity}
                />
                <Toggle 
                    label="Deal Health Scoring" 
                    description="Live probability updates (0-100%)."
                    checked={config.enableDealHealth}
                    onChange={(v: boolean) => updateConfig('enableDealHealth', v)}
                    icon={Brain}
                />
                </div>
            </section>

             {/* System Limits / Gating */}
             <section className="space-y-6 pt-6 border-t border-slate-800">
                 <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Sliders size={16} /> System Gating & Limits
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                        <label className="text-sm font-medium text-slate-300 block mb-3">Max Call Duration (mins)</label>
                        <input 
                            type="range" 
                            min="15" max="180" step="15"
                            value={config.systemLimits.maxCallDuration}
                            onChange={(e) => updateSystemLimit('maxCallDuration', parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mb-2"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>15m</span>
                            <span className="text-white font-mono">{config.systemLimits.maxCallDuration}m</span>
                            <span>180m</span>
                        </div>
                    </div>

                     <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                        <label className="text-sm font-medium text-slate-300 block mb-3">Suggestion Frequency</label>
                        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                            {['Low', 'Medium', 'High'].map((freq) => (
                                <button 
                                    key={freq}
                                    onClick={() => updateSystemLimit('suggestionFrequency', freq)}
                                    className={clsx(
                                        "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                                        config.systemLimits.suggestionFrequency === freq ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {freq}
                                </button>
                            ))}
                        </div>
                    </div>

                     <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                        <label className="text-sm font-medium text-slate-300 block mb-3">Memory Retention</label>
                         <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                            {['Session', 'User', 'Account'].map((ret) => (
                                <button 
                                    key={ret}
                                    onClick={() => updateSystemLimit('memoryRetention', ret)}
                                    className={clsx(
                                        "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                                        config.systemLimits.memoryRetention === ret ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {ret}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
          </div>
      )}

      {/* --- USER MANAGEMENT --- */}
      {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Settings size={16} /> User Roles & Permissions
                </h2>
                <button className="px-3 py-1.5 bg-primary-600/10 text-primary-400 hover:bg-primary-600/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                    <Plus size={16} /> Invite User
                </button>
            </div>
            
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950 text-slate-500 font-medium uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Permissions</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {users.map((user) => (
                                <tr key={user.id} className="group hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-white">{user.name}</div>
                                        <div className="text-slate-500 text-xs">{user.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <select 
                                            value={user.role}
                                            onChange={(e) => {
                                                const updated = { ...user, role: e.target.value as any };
                                                handleSaveUser(updated);
                                            }}
                                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-300 text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                                        >
                                            <option value="Seller">Seller</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Owner">Owner</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                            user.status === 'Active' ? "bg-green-500/10 text-green-400" : "bg-slate-700 text-slate-400"
                                        )}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1">
                                            {Object.entries(user.permissions).filter(([_, v]) => v).slice(0, 3).map(([k]) => (
                                                <div key={k} className="w-1.5 h-1.5 rounded-full bg-primary-500" title={k.replace('can', '')} />
                                            ))}
                                            {Object.values(user.permissions).filter(v => v).length > 3 && (
                                                <span className="text-[10px] text-slate-500">+</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => setEditingUser(user)}
                                            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                            title="Edit Permissions"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {editingUser && <UserEditModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}
          </div>
      )}

      {/* --- PLAYBOOKS --- */}
      {activeTab === 'playbooks' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Brain size={16} /> Objection Playbooks
                </h2>
                <button className="px-3 py-1.5 bg-primary-600 text-white hover:bg-primary-500 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-primary-900/20">
                    <Plus size={16} /> Create Playbook
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playbooks.map(pb => (
                    <div key={pb.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-white font-bold">{pb.name}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Trigger: "{pb.trigger}"</p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"><Edit2 size={14} /></button>
                                <button onClick={() => handleDeletePlaybook(pb.id)} className="p-1.5 text-red-400 hover:text-red-300 bg-red-900/20 rounded-lg"><Trash2 size={14} /></button>
                            </div>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm text-slate-300 italic">
                            "{pb.responseStrategy}"
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <span className={clsx("text-xs px-2 py-0.5 rounded-full", pb.isActive ? "bg-green-900/30 text-green-400" : "bg-slate-800 text-slate-500")}>
                                {pb.isActive ? 'Active' : 'Draft'}
                            </span>
                            <span className="text-xs text-slate-600">Updated 2d ago</span>
                        </div>
                    </div>
                ))}
                
                {/* Empty State / Add New Placeholder */}
                <button className="border border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-slate-600 hover:text-slate-400 hover:border-slate-700 transition-all gap-3 h-full min-h-[160px]">
                    <Plus size={24} />
                    <span className="text-sm font-medium">Add Custom Response Strategy</span>
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminView;