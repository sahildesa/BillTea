"use client";

import React, { useMemo, useState } from "react";

const branches = [
  {
    id: 1,
    name: "Main Branch",
    location: "Ahmedabad, Gujarat",
    manager: "Rahul Sharma",
    phone: "+91 9876543210",
    staff: 18,
    customers: 324,
    main: true,
    active: true,
  },
  {
    id: 2,
    name: "Surat Branch",
    location: "Surat, Gujarat",
    manager: "Priya Patel",
    phone: "+91 9876501234",
    staff: 12,
    customers: 201,
    main: false,
    active: true,
  },
  {
    id: 3,
    name: "Rajkot Branch",
    location: "Rajkot, Gujarat",
    manager: "Amit Joshi",
    phone: "+91 9988776655",
    staff: 8,
    customers: 126,
    main: false,
    active: false,
  },
];

export default function BranchSettingsPage() {
  const [search, setSearch] = useState("");

      const filteredBranches = useMemo(() => {
        const value = search.toLowerCase().trim();

        if (!value) return branches;

        return branches.filter((branch) =>
          [
            branch.name,
            branch.location,
            branch.manager,
            branch.phone,
          ]
            .join(" ")
            .toLowerCase()
            .includes(value)
        );
      }, [search]);

  return (
    <div className="flex-1 overflow-y-auto p-8 relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(125,211,252,0.05),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.05),transparent_40%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
          <span>Settings</span>
          <span>/</span>
          <span className="text-primary font-medium">
            Branch Management
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">

          <div>
            <h1 className="text-4xl font-black text-on-surface mb-2">
              Branch Management
            </h1>

            <p className="text-on-surface-variant text-lg">
              Manage all your business branches from one place.
            </p>
          </div>

          <button className="h-12 px-6 rounded-xl bg-primary text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all">
            <span className="material-symbols-outlined">
              add
            </span>

            Add New Branch
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">

           <div className="relative w-full max-w-md mb-8">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>

            <input
              type="text"
              placeholder="Search branches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 rounded-xl border border-gray-300 bg-white pl-12 pr-4 text-gray-800 outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {filteredBranches.map((branch) => (

            <div
              key={branch.id}
              className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-primary/40 transition-all duration-300"
            >


              {/* Top */}

              <div className="flex justify-between items-start">

                <div>

                  <div className="flex items-center gap-3 flex-wrap">

                    <h2 className="text-2xl font-bold text-on-surface">
                      {branch.name}
                    </h2>

                    {branch.main && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 border border-primary/30 text-primary">
                        MAIN
                      </span>
                    )}

                    {branch.active ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/15 border border-green-500/30 text-green-400">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 border border-red-500/30 text-red-400">
                        INACTIVE
                      </span>
                    )}

                  </div>

                  <div className="flex items-center gap-2 mt-3 text-on-surface-variant">

                    <span className="material-symbols-outlined text-base">
                      location_on
                    </span>

                    <span>{branch.location}</span>

                  </div>

                </div>

                <button className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center">

                  <span className="material-symbols-outlined">
                    more_vert
                  </span>

                </button>

              </div>

                            {/* Information Grid */}
              <div className="grid grid-cols-2 gap-4 mt-8">

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-lg">
                      person
                    </span>
                    <span className="text-xs text-on-surface-variant uppercase">
                      Manager
                    </span>
                  </div>

                  <p className="text-on-surface font-semibold">
                    {branch.manager}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-lg">
                      call
                    </span>
                    <span className="text-xs text-on-surface-variant uppercase">
                      Phone
                    </span>
                  </div>

                  <p className="text-on-surface font-semibold">
                    {branch.phone}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-lg">
                      groups
                    </span>
                    <span className="text-xs text-on-surface-variant uppercase">
                      Staff
                    </span>
                  </div>

                  <p className="text-2xl font-bold text-on-surface">
                    {branch.staff}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-lg">
                      diversity_3
                    </span>
                    <span className="text-xs text-on-surface-variant uppercase">
                      Customers
                    </span>
                  </div>

                  <p className="text-2xl font-bold text-on-surface">
                    {branch.customers}
                  </p>
                </div>

              </div>

              {/* Bottom Actions */}

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">

                <button className="px-5 py-2.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-all">
                  View Details
                </button>

                <button className="px-5 py-2.5 rounded-lg bg-primary text-white hover:opacity-90 transition-all">
                  Edit Branch
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}