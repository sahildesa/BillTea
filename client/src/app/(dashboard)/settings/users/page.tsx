'use client';

import React from 'react';

// Mock Data
const users = [
  {
    id: 1,
    name: 'Julian Thorne',
    email: 'julian.thorne@billaro.com',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLt5_BvH-8ashmcdV9Uqh_LZyK4W2ILZYvnKYDZwQFe0dipsrMQLOyNcgKPNQ9CR0EsQjUPncgXcOw_01vBwi6fmC6i4pWuxzpiRGUYvMMxtG9VoAdI9ypitRGye9K0NL0zyyaxvUZNquwF_-ijNRAXKNvPHkcRFG2OC1oExKme3NvT-1-T21Vcu4FBcn9vSiW91V7spAwcd0u1ItbelVCrV2-Ua_ROHSPrPNbnRF0Db0TKtr_IXqyCFR7I',
    role: 'Administrator',
    roleClass: 'bg-secondary-container/30 text-secondary border-secondary/20',
    branch: 'Main Headquarters',
    status: 'Active',
    statusClass: 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    statusTextClass: 'text-[#10b981]',
  },
  {
    id: 2,
    name: 'Elena Rodriguez',
    email: 'e.rodriguez@billaro.com',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLtb2ywpkmK1_njXX6iCD5fyg7JDTm2dvz76ufTPu561c5AaBazWDfBDgCriA2F7UuuxOq_9ei_D2iD4nd8IyTR-14DEo9ptpQv1oAY4_aQE7w-0tDJn3yYFUBJZjcLjWLu7NynfOTfOJcBqtAZc4YrxNXCMEUo-fgG1Zl1_VqSWq-JrsYR_tN-lUOhGuxRH88UZBMtd2oS0iFE7qtJYGsAa5dY__qAFHLAjlZnpq7Agwl70Vap16Z9CHc4',
    role: 'Manager',
    roleClass: 'bg-primary-container/20 text-primary border-primary/20',
    branch: 'North Sector',
    status: 'Active',
    statusClass: 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    statusTextClass: 'text-[#10b981]',
  },
  {
    id: 3,
    name: 'Marcus Sterling',
    email: 'm.sterling@billaro.com',
    avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLvV2ySb5mx4RFLC83xiKnWnhGdGn6tqxSNnLppQeqgaUOGjwIvVFXuRHE8fLhOQ17nykrNDRIPsSbb_WQSKHwXRuqSweScQTQ9i1C8tUf_CFKZlBJXWDOxLHTHEJVYIjiA1i0fTA7bemFWG5u_Wh-vy76cRCgMdf0Z-o7qSvOdjAcvOlrEwuk2CGdDHFBH92gQExC2iy9gX9gtcqdhLyIl5M7dcanswJOWXc-Rr69nCgMuLLDJrwzzowwo',
    role: 'Staff',
    roleClass: 'bg-surface-variant text-on-surface-variant border-outline-variant/30',
    branch: 'Main Headquarters',
    status: 'Inactive',
    statusClass: 'bg-outline-variant',
    statusTextClass: 'text-on-surface-variant',
  },
];

const recentLogins = [
  {
    id: 1,
    title: 'Julian Thorne logged in',
    subtitle: 'Browser: Chrome on macOS • IP: 192.168.1.45',
    time: '2 mins ago',
    icon: 'login',
    iconClass: 'bg-primary/20 text-primary'
  },
  {
    id: 2,
    title: 'Password Reset: Elena Rodriguez',
    subtitle: 'Actioned by System Admin',
    time: '45 mins ago',
    icon: 'security_update_good',
    iconClass: 'bg-secondary/20 text-secondary'
  },
  {
    id: 3,
    title: 'Failed Login Attempt',
    subtitle: 'Unknown Device • Location: Madrid, ES',
    time: '2 hours ago',
    icon: 'report_problem',
    iconClass: 'bg-error/20 text-error'
  }
];

const roleDistribution = [
  { role: 'Administrators', count: 24, percentage: 15, barClass: 'bg-secondary' },
  { role: 'Managers', count: 112, percentage: 35, barClass: 'bg-primary' },
  { role: 'Standard Staff', count: 1148, percentage: 85, barClass: 'bg-surface-tint' },
];

function UserTable() {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-primary/10">
      {/* Table Header/Filters */}
      <div className="p-6 border-b border-primary/10 flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/30">
        <div className="flex items-center gap-4">
          <span className="font-medium text-sm text-on-surface">Filter By:</span>
          <div className="flex gap-1">
            <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">All Roles</button>
            <button className="px-4 py-1.5 rounded-full text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors">Admin</button>
            <button className="px-4 py-1.5 rounded-full text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors">Staff</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-lg">tune</span> Filters
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-highest/20">
              <th className="px-6 py-4 text-on-surface-variant font-medium text-xs uppercase tracking-wider">User Profile</th>
              <th className="px-6 py-4 text-on-surface-variant font-medium text-xs uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-on-surface-variant font-medium text-xs uppercase tracking-wider">Branch Assignment</th>
              <th className="px-6 py-4 text-on-surface-variant font-medium text-xs uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-on-surface-variant font-medium text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shadow-sm" src={user.avatar} />
                    <div>
                      <p className="font-medium text-sm text-on-surface">{user.name}</p>
                      <p className="text-sm text-on-surface-variant opacity-70">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${user.roleClass}`}>{user.role}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span className="text-sm font-medium">{user.branch}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.statusClass}`}></div>
                    <span className={`text-xs font-bold ${user.statusTextClass}`}>{user.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary/20 hover:text-primary transition-all" title="Edit">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary/20 hover:text-secondary transition-all" title="Reset Password">
                      <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-error/20 hover:text-error transition-all" title="Delete">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer */}
      <div className="p-6 border-t border-primary/10 flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/30">
        <p className="text-sm text-on-surface-variant">Showing <span className="text-on-surface font-bold">1-10</span> of <span className="text-on-surface font-bold">1,284</span> entries</p>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-primary/10 text-on-surface-variant hover:bg-primary/10 transition-colors disabled:opacity-30" disabled>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="flex gap-1">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold shadow-lg shadow-primary/20">1</button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium">2</button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium">3</button>
            <span className="w-9 h-9 flex items-center justify-center text-sm font-medium text-on-surface-variant">...</span>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium">129</button>
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-primary/10 text-on-surface-variant hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivityFeed() {
  return (
    <div className="lg:col-span-2 glass-panel p-6 rounded-2xl relative z-10 border border-primary/10 hover:border-primary/20 transition-all duration-300 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xl font-bold text-on-surface">Recent System Logins</h4>
        <button className="text-sm text-primary font-bold hover:underline">View All Logs</button>
      </div>
      <div className="space-y-4">
        {recentLogins.map(log => (
          <div key={log.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container/50 transition-colors border border-transparent hover:border-primary/10">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${log.iconClass}`}>
              <span className="material-symbols-outlined">{log.icon}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-on-surface">{log.title}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{log.subtitle}</p>
            </div>
            <span className="text-xs text-on-surface-variant">{log.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleDistribution() {
  return (
    <div className="glass-panel p-6 rounded-2xl h-fit relative z-10 border border-primary/10 hover:border-primary/20 transition-all duration-300 shadow-xl">
      <h4 className="text-xl font-bold text-on-surface mb-6">Role Distribution</h4>
      <div className="space-y-6">
        {roleDistribution.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-on-surface-variant font-medium">{item.role}</span>
              <span className="font-bold text-on-surface">{item.count.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div className={`${item.barClass} h-full rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]`} style={{ width: `${item.percentage}%` }}></div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t border-primary/10">
        <button className="w-full py-2.5 rounded-xl border border-primary/30 text-primary font-bold text-sm hover:bg-primary/10 transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">settings</span>
          Manage Permissions Matrix
        </button>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 z-0 relative overflow-x-hidden selection:bg-primary/30">
      {/* Mesh Background */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(125,211,252,0.05)_0%,_transparent_40%),_radial-gradient(circle_at_80%_80%,_rgba(200,160,240,0.05)_0%,_transparent_40%)] pointer-events-none"></div>

      {/* Subtle Animated Background Elements */}
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full z-0 animate-pulse pointer-events-none"></div>
      <div className="fixed top-20 left-64 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full z-0 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-8 pb-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-3">User Management</h1>
            <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
              Manage team access, roles, and permissions across your organization.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(125,211,252,0.2)]">
            <span className="material-symbols-outlined">person_add</span>
            <span>Add New User</span>
          </button>
        </header>

        {/* Main Data Table Container */}
        <UserTable />

        {/* Contextual Grid/Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
          <ActivityFeed />
          <RoleDistribution />
        </div>
      </div>
    </div>
  );
}
