'use client'
import { Button } from "@/components/ui/button";
import { Trash2, Plus, MoreVertical, User, Search, Download, Upload, UserCheck, UserX } from "lucide-react";

// Updated data structure to match the new table design
const contacts = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@acmecorp.com",
    title: "Senior Manager",
    company: "Acme Corporation",
    hasAccountExecutive: true,
    accountExecutive: "Alice Smith",
    lastContact: "Jan 4, 2024",
    status: "Active"
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@betallc.com",
    title: "Lead Developer",
    company: "Beta LLC",
    hasAccountExecutive: false,
    accountExecutive: null,
    lastContact: "Jan 3, 2024",
    status: "Prospect"
  },
  {
    id: 3,
    firstName: "Sam",
    lastName: "Wilson",
    email: "sam.wilson@gammainc.com",
    title: "UX Designer",
    company: "Gamma Inc",
    hasAccountExecutive: true,
    accountExecutive: "Bob Lee",
    lastContact: "Jan 2, 2024",
    status: "Active"
  },
  {
    id: 4,
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@deltatech.com",
    title: "Product Manager",
    company: "Delta Tech",
    hasAccountExecutive: true,
    accountExecutive: "Carol Davis",
    lastContact: "Dec 28, 2023",
    status: "Inactive"
  },
  {
    id: 5,
    firstName: "Mike",
    lastName: "Brown",
    email: "mike.brown@epsilon.com",
    title: "CTO",
    company: "Epsilon Solutions",
    hasAccountExecutive: false,
    accountExecutive: null,
    lastContact: "Jan 1, 2024",
    status: "Lead"
  }
];

export default function ContactsPage() {
  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center pt-16 px-4">
      <div
        className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-12 flex flex-col items-center"
        style={{ minHeight: "700px" }}
      >
        {/* Header: Title/Subtitle left, Search/Buttons right */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          {/* Left: Title and Subtitle */}
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-extrabold text-[#232323] mb-1 text-left">Contacts</h1>
            <p className="text-lg text-[#6d6d6d] text-left">Manage your contacts and account executives.</p>
          </div>
          {/* Right: Search and Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="mb-2 sm:mb-0">
              <div className="flex items-center w-full max-w-xs bg-white border border-[#ffe3d1] rounded-lg shadow-sm px-4 py-2">
                <Search className="text-[#ff6600] mr-2" size={20} />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="flex-1 bg-transparent outline-none text-base text-[#232323] placeholder-[#bdbdbd]"
                />
              </div>
            </div>
            <Button className="px-4 bg-[#ff6600] hover:bg-[#ff7a2f] text-white font-bold rounded-lg shadow transition-all">
              Detach Account Executive
            </Button>
            <Button variant="default" className="px-4 font-bold rounded-lg shadow transition-all">
              Upload Contacts
            </Button>
          </div>
        </div>

        {/* Custom Table Section */}
        <div className="w-full">
          <div className="flex flex-col mt-6">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="py-3.5 px-4">
                          <input type="checkbox" className="text-blue-500 border-gray-300 rounded dark:bg-gray-900 dark:ring-offset-gray-900 dark:border-gray-700" />
                        </th>
                        <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">First Name</th>
                        <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Last Name</th>
                        <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Title</th>
                        <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Company</th>
                        <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Has Account Executive</th>
                        <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Account Executive</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                      {contacts.map((contact) => (
                        <tr key={contact.id}>
                          <td className="px-4 py-4">
                            <input type="checkbox" className="text-blue-500 border-gray-300 rounded dark:bg-gray-900 dark:ring-offset-gray-900 dark:border-gray-700" />
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-800 dark:text-white">{contact.firstName}</td>
                          <td className="px-4 py-4 text-sm text-gray-800 dark:text-white">{contact.lastName}</td>
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">{contact.title}</td>
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">{contact.company}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              contact.hasAccountExecutive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {contact.hasAccountExecutive ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              contact.accountExecutive
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {contact.accountExecutive ? contact.accountExecutive : "Not assigned"}
                            </span>
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
    </main>
  );
} 