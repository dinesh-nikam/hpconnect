"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import DarkModeToggle from '@/components/DarkModeToggle';
import { FaSort, FaSortUp, FaSortDown, FaFilter, FaEdit, FaTrash, FaSearch, FaFileExport, FaBars } from 'react-icons/fa';
import Papa from "papaparse";

const PAGE_SIZE = 10;

const columns = [
  { label: "First Name", field: "firstName" },
  { label: "Last Name", field: "lastName" },
  { label: "Company", field: "companyName" },
  { label: "Designation", field: "designation" },
  { label: "Mobile", field: "mobile" },
  { label: "Email", field: "email" },
  { label: "Address", field: "address" },
  { label: "City", field: "city" },
  { label: "State", field: "state" },
  { label: "Country", field: "country" },
  { label: "Pincode", field: "pincode" },
  { label: "Feedback", field: "feedback" },
  { label: "Visited Date (User)", field: "visitedDate" },
  { label: "Visited Date (Auto)", field: "createdAt" },
];

const Sidebar = ({ active }: { active: string }) => (
  <aside className="w-64 bg-white/90 border-r border-gray-200 flex flex-col min-h-screen px-6">
    <div className="flex items-center justify-center h-16 mb-6">
      <Image src="/images/1.png" className="object-fit" alt="HP Connect" width={180} height={80} />
    </div>
    <nav className="flex-1">
      <div className="text-xs text-gray-400 mb-2">MAIN</div>
      <ul className="mb-6 space-y-1">
        <li>
          <a
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-semibold ${active === 'dashboard' ? 'text-hpblue bg-hpblue/10' : 'text-gray-700 hover:bg-hpblue/10 transition'}`}
            href="/admin/dashboard/DC"
          >
            Dashboard
          </a>
        </li>
      </ul>
    </nav>
  </aside>
);

export default function DashboardClient({ session }: { session: any }) {
    const router = useRouter();
    const [visitors, setVisitors] = useState<any[]>([]);
    const [selected, setSelected] = useState<boolean[]>([]);
    const [loading, setLoading] = useState(true);
    const [visitorCount, setVisitorCount] = useState(0);
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<string>("firstName");
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("asc");
    const [filter, setFilter] = useState<string>("");
    const [dateSearch, setDateSearch] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const isAdmin = session?.user?.username === 'admin';

    useEffect(() => {
        console.log("[DashboardClient] session:", session);
        // Temporarily remove session check for debugging
        // if (!session || !session.user || !session.expires) return;
        async function fetchVisitors() {
            setLoading(true);
            try {
                console.log("[DashboardClient] Fetching visitors...");
                const res = await fetch("/api/visitors");
                if (!res.ok) throw new Error("Failed to fetch visitors");
                const data = await res.json();
                console.log("[DashboardClient] Visitors fetched:", data.visitors);
                setVisitors(data.visitors || []);
                setSelected((data.visitors || []).map((v: any) => false));
                setVisitorCount(data.visitorsCount || 0);
            } catch (error) {
                console.error("Error fetching visitors:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchVisitors();
    }, [session]);


    // Search, sort, filter, export, edit, delete handlers
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
    const handleSort = (field: string) => {
        if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        else { setSortField(field); setSortOrder("asc"); }
    };
    const handleFilter = (field: string, value: string) => setFilter(value);
    const handleExport = () => {
        const csv = [
            [
                "First Name", "Last Name", "Company", "Designation", "Mobile", "Email", "Address", "City", "State", "Country", "Pincode", "Feedback"
            ].join(","),
            ...filteredVisitors.map(v => [
                v.firstName, v.lastName, v.companyName, v.designation, v.mobile, v.email, v.address, v.city, v.state, v.country, v.pincode, v.feedback
            ].map(x => `"${x ?? ''}"`).join(","))
        ].join("\n");
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'visitors.csv';
        a.click();
        URL.revokeObjectURL(url);
    };
    



    const handleEdit = (visitor: any) => alert(`Edit visitor: ${visitor.firstName} ${visitor.lastName}`);
    const handleDelete = (visitor: any) => {
        if (window.confirm(`Delete visitor: ${visitor.firstName} ${visitor.lastName}?`)) {
            setVisitors(visitors.filter(v => v._id !== visitor._id));
        }
    };

    // Make visitedDate editable and save to backend
    const handleVisitedDateChange = async (idx: number, newDate: string) => {
        const visitor = filteredVisitors[idx];
        if (!visitor || !visitor._id) return;
        setVisitors(visitors.map((item, i) => item._id === visitor._id ? { ...item, visitedDate: newDate } : item));
        // Save to backend
        try {
            const res = await fetch('/api/visitors', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: visitor._id, visitedDate: newDate })
            });
            if (!res.ok) {
                const err = await res.json();
                alert('Failed to update visited date: ' + (err.error || res.status));
            }
        } catch (e) {
            alert('Network error while updating visited date');
        }
    };

    // Filter, search, sort visitors
    let filteredVisitors = visitors.filter(v => {
        const matchesText = Object.values(v).join(" ").toLowerCase().includes(search.toLowerCase());
        const matchesDate = dateSearch
            ? v.visitedDate && v.visitedDate.startsWith(dateSearch)
            : true;
        return matchesText && matchesDate;
    });
    if (filter) filteredVisitors = filteredVisitors.filter(v => v.companyName === filter);
    filteredVisitors = filteredVisitors.sort((a, b) => {
        if (!a[sortField] || !b[sortField]) return 0;
        if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredVisitors.length / PAGE_SIZE);
    const paginatedVisitors = filteredVisitors.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // Helper for pagination range with ellipsis
    function getPaginationRange(current: number, total: number) {
      const delta = 2;
      const range = [];
      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        range.push(i);
      }
      if (current - delta > 2) range.unshift('...');
      if (current + delta < total - 1) range.push('...');
      range.unshift(1);
      if (total > 1) range.push(total);
      return range;
    }
    const paginationRange = getPaginationRange(currentPage, totalPages);

    return (
      <div className="flex bg-coolgray min-h-screen flex-col md:flex-row">
        
        
        {/* Sidebar */}
        <div className={`fixed md:static z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
          style={{ width: 256 }}
        >
          <Sidebar active="dashboard" />
        </div>
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        {/* Main Content */}
        <main className="flex-1 p-4 overflow-x-auto md:ml-0 mt-16 md:mt-0">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
{/* Hamburger for mobile */}
                   <button
          className="md:hidden fixed  bg-white p-2 rounded-full shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Open sidebar"
        >
          <FaBars size={24} />
        </button>
                     <button className="rounded p-2 hover:bg-gray-100">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 6h18M3 12h18M3 18h18"
                                    />
                                </svg>
                            </button>


                    <h1 className="text-2xl font-bold text-black">Reports</h1>
 </div>
                    <div className="flex items-center gap-4">
                      {/* <DarkModeToggle /> */}
                        <Image src="/images/2.png" className="object-fit" alt="HP Connect" width={120} height={55} />
           


                   
                        <button className="rounded-full p-2 hover:bg-gray-200">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                        </button>
                        <div className="rounded-full bg-gray-200 w-10 h-10 flex items-center justify-center font-bold text-gray-700">
                            <Image
                                src="/images/profile.jpg"
                                alt="User Avatar"
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="rounded-2xl bg-white shadow p-2 flex flex-col items-start">
                     <button className="px-4 py-2 rounded bg-hpblue text-gray-600 font-semibold">
  Total Visitors

  <h1 className="text-4xl font-bold ">{visitorCount}</h1>
  
</button>
                    
                    </div>
                    {/* <div className="rounded-2xl bg-white shadow p-6 flex flex-col items-start">
                        
                    </div>
                    <div className="rounded-2xl bg-white shadow p-6 flex flex-col items-start">
                        
                    </div>
                    <div className="rounded-2xl bg-white shadow p-6 flex flex-col items-start">
                       
                    </div> */}
                </div>
                <div className="rounded-2xl bg-white shadow p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="font-bold text-lg">Visitor </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={dateSearch}
                                onChange={e => setDateSearch(e.target.value)}
                                className="rounded border border-gray-200 px-2 py-1 text-sm"
                                placeholder="Search by date"
                            />
                            <button className="rounded p-2 hover:bg-gray-100">
                                <FaFilter />
                            </button>
                            <select className="rounded border border-gray-200 px-2 py-1 text-sm" onChange={e => handleFilter('companyName', e.target.value)}>
                                <option value="">All Companies</option>
                                {[...new Set(visitors.map(v => v.companyName))].filter(Boolean).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-8">Loading visitors...</div>
                        ) : (
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-gray-600 border-slate-200 text-xs uppercase">
                                        <th className="px-2 py-2">
                                            <input
                                                type="checkbox"
                                                checked={selected.length > 0 && selected.every(Boolean)}
                                                onChange={e => setSelected(selected.map(() => e.target.checked))}
                                            />
                                        </th>
                                        {columns.map(col => (
                                            <th key={col.field} className="px-2 py-2 text-left cursor-pointer select-none" onClick={() => handleSort(col.field)}>
                                                <span className="flex items-center gap-1">
                                                    {col.label}
                                                    {sortField === col.field ? (
                                                        sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />
                                                    ) : <FaSort className="opacity-40" />}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedVisitors.length === 0 && !loading ? (
                                        <tr>
                                            <td colSpan={columns.length + 1} className="text-center py-4 text-gray-400">No visitors found.</td>
                                        </tr>
                                    ) : (
                                        paginatedVisitors.map((v, i) => (
                                            <tr key={v._id || i} className="hover:bg-gray-50">
                                                <td className="px-2 py-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected[i + (currentPage - 1) * PAGE_SIZE]}
                                                        onChange={e => setSelected(selected.map((s, idx) => idx === i + (currentPage - 1) * PAGE_SIZE ? e.target.checked : s))}
                                                    />
                                                </td>
                                                <td className="px-2 py-2">{v.firstName}</td>
                                                <td className="px-2 py-2">{v.lastName}</td>
                                                <td className="px-2 py-2">{v.companyName}</td>
                                                <td className="px-2 py-2">{v.designation}</td>
                                                <td className="px-2 py-2">{v.mobile}</td>
                                                <td className="px-2 py-2">{v.email}</td>
                                                <td className="px-2 py-2">{v.address}</td>
                                                <td className="px-2 py-2">{v.city}</td>
                                                <td className="px-2 py-2">{v.state}</td>
                                                <td className="px-2 py-2">{v.country}</td>
                                                <td className="px-2 py-2">{v.pincode}</td>
                                                <td className="px-2 py-2">{v.feedback}</td>
                                                <td className="px-2 py-2">
                                                    {isAdmin ? (
                                                      <input
                                                        type="date"
                                                        value={v.visitedDate ? new Date(v.visitedDate).toISOString().slice(0, 10) : ''}
                                                        onChange={e => handleVisitedDateChange(i + (currentPage - 1) * PAGE_SIZE, e.target.value)}
                                                        className="w-40 rounded border border-gray-200 px-2 py-1 text-sm"
                                                      />
                                                    ) : (
                                                      v.visitedDate ? new Date(v.visitedDate).toLocaleDateString() : <span className="text-gray-400">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-2 py-2">
                                                  {v.createdAt ? new Date(v.createdAt).toLocaleString() : <span className="text-gray-400">N/A</span>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center gap-2 mt-4">
                      <button
                        className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      {paginationRange.map((page, idx) =>
                        page === '...'
                          ? <span key={idx} className="px-2">...</span>
                          : <button
                              key={page}
                              className={`px-3 py-1 rounded font-semibold ${currentPage === page ? 'bg-gray-100  text-gray-700 ' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
                              onClick={() => setCurrentPage(Number(page))}
                              disabled={currentPage === page}
                            >
                              {page}
                            </button>
                      )}
                      <button
                        className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                </div>
                {/* CSV Export/Import Buttons Below Table */}
                <div className="flex justify-start mt-4 gap-4">
                    <button
                        className=" px-4 py-2 rounded bg-hpblue text-white  bg-blue-600 font-semibold shadow hover:bg-gradient-to-r hover:from-hpblue hover:to-blue-400 transition"
                        onClick={handleExport}
                        disabled={filteredVisitors.length === 0}
                    >
                        Export
                    </button>
                   
                </div>
                 
                  
               
            </main>
        </div>
    );
}
