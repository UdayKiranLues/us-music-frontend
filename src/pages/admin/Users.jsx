import { useState } from 'react';
import { Search, Shield, Ban, CheckCircle, Mail, Calendar, MoreVertical } from 'lucide-react';
import GlassCard from '@/components/admin/GlassCard';

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with API call
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      status: 'active',
      joinDate: '2024-01-15',
      lastActive: '2 hours ago',
      playlists: 12,
      favorites: 45,
    },
    {
      id: 2,
      name: 'Sarah Smith',
      email: 'sarah@example.com',
      role: 'artist',
      status: 'active',
      joinDate: '2024-02-20',
      lastActive: '5 hours ago',
      playlists: 8,
      favorites: 32,
    },
    {
      id: 3,
      name: 'Admin User',
      email: 'admin@usmusic.com',
      role: 'admin',
      status: 'active',
      joinDate: '2023-12-01',
      lastActive: 'Just now',
      playlists: 0,
      favorites: 0,
    },
    {
      id: 4,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'user',
      status: 'suspended',
      joinDate: '2024-03-10',
      lastActive: '2 days ago',
      playlists: 5,
      favorites: 18,
    },
  ]);

  const roles = ['all', 'user', 'artist', 'admin'];
  const statuses = ['all', 'active', 'suspended'];

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  const handleSuspend = (userId) => {
    setUsers(
      users.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
          : u
      )
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
          <p className="text-gray-400">Manage user accounts and permissions</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{users.length}</p>
          <p className="text-sm text-gray-400">Total Users</p>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-orange/50 transition-colors appearance-none cursor-pointer"
          >
            {roles.map((role) => (
              <option key={role} value={role} className="bg-dark-lighter">
                {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-orange/50 transition-colors appearance-none cursor-pointer"
          >
            {statuses.map((status) => (
              <option key={status} value={status} className="bg-dark-lighter">
                {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Users Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-orange to-accent-red flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Mail className="w-3 h-3" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`px-3 py-1 text-xs font-medium rounded-full border cursor-pointer ${
                        user.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          : user.role === 'artist'
                          ? 'bg-accent-blue/20 text-accent-blue border-accent-blue/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="artist">Artist</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="space-y-1">
                      <p>{user.playlists} playlists</p>
                      <p>{user.favorites} favorites</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleSuspend(user.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.status === 'active'
                            ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                            : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'
                        }`}
                        title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                      >
                        {user.status === 'active' ? (
                          <Ban className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default Users;
