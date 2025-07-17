'use client'
import { Button } from "@/components/ui/button";
import { Trash2, Plus, MoreVertical, FileText, Users, Download, Upload } from "lucide-react";

// Updated data structure to match the new table design
const marketingLists = [
  {
    id: 1,
    status: "Active",
    name: "Newsletter Subscribers",
    audience: "All Users",
    count: "1,200",
    lastUpdated: "Jan 4, 2024",
    createdBy: "John Doe",
    accountExecutive: null, // or undefined if none
  },
  {
    id: 2,
    status: "Draft",
    name: "VIP Clients",
    audience: "Premium",
    count: "50",
    lastUpdated: "Jan 3, 2024",
    createdBy: "Jane Smith",
    accountExecutive: "Hello Me", // example with AE
  },
  {
    id: 3,
    status: "Active",
    name: "Product Updates",
    audience: "Customers",
    count: "850",
    lastUpdated: "Jan 2, 2024",
    createdBy: "Mike Johnson"
  },
  {
    id: 4,
    status: "Inactive",
    name: "Promotional Offers",
    audience: "Subscribers",
    count: "2,100",
    lastUpdated: "Dec 28, 2023",
    createdBy: "Sarah Wilson"
  }
];

export default function ListsPage() {
  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center pt-16 px-4">
      <div
        className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-12 flex flex-col items-center"
        style={{ minHeight: "700px" }}
      >
        {/* Title, Subtitle, and Actions */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#232323] mb-1 text-left">Marketing Lists</h1>
            <p className="text-lg text-[#6d6d6d] text-left">Manage and track your marketing lists.</p>
          </div>
          <Button className="flex items-center gap-2 px-4 py-2 bg-[#ff6600] hover:bg-[#ff7a2f] text-white font-bold rounded-lg shadow transition-all">
            <Plus size={22} /> Add Marketing List
          </Button>
        </div>

        {/* Custom Table Section */}
        <div className="w-full">
          <div className="w-full flex flex-col mt-6">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="py-3.5 px-4 text-sm font-normal text-left text-gray-500 dark:text-gray-400">#</th>
                        <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">List Name</th>
                        <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Audience</th>
                        <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Count</th>
                        <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                      {marketingLists.map((list, idx) => (
                        <tr key={list.id}>
                          <td className="px-4 py-4 text-sm text-gray-800 dark:text-white">{idx + 1}</td>
                          <td className="px-4 py-4 text-sm text-gray-800 dark:text-white">{list.name}</td>
                          <td className="px-4 py-4 text-sm text-gray-800 dark:text-white">
                            <div>
                              <div>{list.audience}</div>
                              {list.accountExecutive && (
                                <div className="mt-2">
                                  <span
                                    className="inline-block px-3 py-1 rounded-md font-bold text-white text-xs"
                                    style={{ background: "#ff9900" }}
                                  >
                                    Account Executive = {list.accountExecutive}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">{list.count}</td>
                          <td className="px-4 py-4 text-sm">
                            <button className="px-1 py-1 text-[#ff6600] transition-colors duration-200 rounded-lg hover:bg-[#fff0e6]" aria-label="Delete list">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {/* Custom Pagination */}
          <div className="flex items-center justify-between mt-6">
            <a href="#" className="flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 rtl:-scale-x-100">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
              </svg>
              <span>previous</span>
            </a>

            <div className="items-center hidden md:flex gap-x-3">
              <a href="#" className="px-2 py-1 text-sm text-blue-500 rounded-md dark:bg-gray-800 bg-blue-100/60">1</a>
              <a href="#" className="px-2 py-1 text-sm text-gray-500 rounded-md dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100">2</a>
              <a href="#" className="px-2 py-1 text-sm text-gray-500 rounded-md dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100">3</a>
              <a href="#" className="px-2 py-1 text-sm text-gray-500 rounded-md dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100">...</a>
              <a href="#" className="px-2 py-1 text-sm text-gray-500 rounded-md dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100">12</a>
              <a href="#" className="px-2 py-1 text-sm text-gray-500 rounded-md dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100">13</a>
              <a href="#" className="px-2 py-1 text-sm text-gray-500 rounded-md dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100">14</a>
            </div>

            <a href="#" className="flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800">
              <span>Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 rtl:-scale-x-100">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Floating action button for mobile */}
      <button
        className="fixed bottom-8 right-8 z-50 sm:hidden bg-[#ff6600] hover:bg-[#ff7a2f] text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all"
        aria-label="Add new Marketing List"
      >
        <Plus size={28} />
      </button>
    </main>
  );
} 