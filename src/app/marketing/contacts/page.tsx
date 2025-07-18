'use client'
import { Button } from "@/components/ui/button";
import { Trash2, Plus, MoreVertical, User, Search, Download, Upload, UserCheck, UserX, Building, Users } from "lucide-react";
import { useState } from "react";

// Marketing contacts data (editable)
const marketingContacts = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@acmecorp.com",
    title: "Senior Manager",
    company: "Acme Corporation",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@betallc.com",
    title: "Lead Developer",
    company: "Beta LLC",
  },
  {
    id: 3,
    firstName: "Sam",
    lastName: "Wilson",
    email: "sam.wilson@gammainc.com",
    title: "UX Designer",
    company: "Gamma Inc",
  },
];

// Prospect Members data (read-only, from API)
const prospectMembers = {
  totalCount: 1250,
  companies: [
    { name: "TechCorp Solutions", count: 45 },
    { name: "Innovate Labs", count: 32 },
    { name: "Digital Dynamics", count: 28 },
    { name: "Future Systems", count: 25 },
    { name: "NextGen Tech", count: 22 },
  ]
};

// Client Members data (read-only, from API)
const clientMembers = {
  totalCount: 850,
  companies: [
    { name: "Enterprise Solutions Inc", count: 38 },
    { name: "Global Tech Partners", count: 35 },
    { name: "Premier Systems", count: 30 },
    { name: "Advanced Technologies", count: 28 },
    { name: "Strategic Innovations", count: 25 },
  ]
};

type ContactType = 'marketing' | 'prospects' | 'clients';

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState<ContactType>('marketing');

  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center pt-16 px-4">
      <div
        className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-12 flex flex-col items-center"
        style={{ minHeight: "700px" }}
      >
        {/* Header: Title/Subtitle */}
        <div className="w-full mb-8">
          <h1 className="text-4xl font-extrabold text-[#232323] mb-1 text-left">Contacts</h1>
          <p className="text-lg text-[#6d6d6d] text-left">Manage your contacts and view member information.</p>
        </div>

        {/* Tab Navigation */}
        <div className="w-full mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('marketing')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'marketing'
                  ? 'bg-white text-[#ff6600] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Marketing Contacts ({marketingContacts.length})
            </button>
            <button
              onClick={() => setActiveTab('prospects')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'prospects'
                  ? 'bg-white text-[#ff6600] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Prospect Members ({prospectMembers.totalCount})
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'clients'
                  ? 'bg-white text-[#ff6600] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Client Members ({clientMembers.totalCount})
            </button>
          </div>
        </div>

        {/* Marketing Contacts Section */}
        {activeTab === 'marketing' && (
          <div className="w-full">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6">
              <div className="flex-1">
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
                Add a New Contact
              </Button>
              <Button variant="default" className="px-4 font-bold rounded-lg shadow transition-all">
                Upload Contacts
              </Button>
            </div>

            {/* Marketing Contacts Table */}
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">First Name</th>
                    <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Last Name</th>
                    <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Title</th>
                    <th className="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400">Company</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                  {marketingContacts.map((contact) => (
                    <tr key={contact.id}>
                      <td className="px-4 py-4 text-sm text-gray-800 dark:text-white">{contact.firstName}</td>
                      <td className="px-4 py-4 text-sm text-gray-800 dark:text-white">{contact.lastName}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">{contact.title}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">{contact.company}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Prospect Members Section */}
        {activeTab === 'prospects' && (
          <div className="w-full">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Prospect Members</h3>
              </div>
              <p className="text-blue-700 mb-4">Read-only view of prospect member data from external API.</p>
              <div className="text-2xl font-bold text-blue-900">{prospectMembers.totalCount} Total Prospects</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Breakdown by Company</h4>
              <div className="space-y-3">
                {prospectMembers.companies.map((company, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-900">{company.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">{company.count} prospects</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Client Members Section */}
        {activeTab === 'clients' && (
          <div className="w-full">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Client Members</h3>
              </div>
              <p className="text-green-700 mb-4">Read-only view of client member data from external API.</p>
              <div className="text-2xl font-bold text-green-900">{clientMembers.totalCount} Total Clients</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Breakdown by Company</h4>
              <div className="space-y-3">
                {clientMembers.companies.map((company, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-900">{company.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">{company.count} clients</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}