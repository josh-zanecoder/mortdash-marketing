'use client'
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Archive, Eye } from 'lucide-react';

const marketingLists = [
  { id: 1, name: 'Newsletter Subscribers' },
  { id: 2, name: 'VIP Clients' },
  { id: 3, name: 'Product Updates' },
  { id: 4, name: 'Holiday Promotions' },
  { id: 5, name: 'DSCR Prospects' },
];

const templateFilters = [
  { label: 'All Templates', value: 'all' },
  { label: 'Holidays', value: 'holidays' },
  { label: 'DSCR', value: 'dscr' },
  { label: 'Others', value: 'others' },
];

const templates = [
  {
    id: 1,
    title: 'Veterans Day',
    date: 'Nov 11, 2024 09:16 AM',
    category: 'holidays',
    image: '/assets/veterans_day.png',
  },
  {
    id: 2,
    title: 'DSCR',
    date: 'Feb 05, 2025 09:16 PM',
    category: 'dscr',
    image: '/assets/dscr.png',
  },
  {
    id: 3,
    title: 'DSCR Loans',
    date: 'Feb 05, 2025 09:16 PM',
    category: 'dscr',
    image: '/assets/dscr_loans.png',
  },
  {
    id: 4,
    title: 'Holiday Greetings',
    date: 'Dec 20, 2024 10:00 AM',
    category: 'holidays',
    image: '/assets/holiday_greetings.png',
  },
  {
    id: 5,
    title: 'Spring Promo',
    date: 'Mar 15, 2025 08:30 AM',
    category: 'others',
    image: '/assets/spring_promo.png',
  },
  {
    id: 6,
    title: 'Summer Savings',
    date: 'Jun 10, 2025 02:45 PM',
    category: 'others',
    image: '/assets/summer_savings.png',
  },
  {
    id: 7,
    title: 'Thanksgiving',
    date: 'Nov 28, 2024 11:00 AM',
    category: 'holidays',
    image: '/assets/thanksgiving.png',
  },
  {
    id: 8,
    title: 'Year-End Review',
    date: 'Dec 31, 2024 04:00 PM',
    category: 'others',
    image: '/assets/year_end_review.png',
  },
  {
    id: 9,
    title: 'DSCR for Investors',
    date: 'Apr 10, 2025 01:20 PM',
    category: 'dscr',
    image: '/assets/dscr_investors.png',
  },
];

export default function CampaignPage() {
  const [selectedList, setSelectedList] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredTemplates = templates.filter((tpl) => {
    const matchesFilter = activeFilter === 'all' || tpl.category === activeFilter;
    const matchesSearch = tpl.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        {/* Select Marketing List */}
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <label className="font-semibold text-sm text-gray-700">Select Marketing List</label>
            <select
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              value={selectedList}
              onChange={e => setSelectedList(e.target.value)}
            >
              <option value="">Choose one</option>
              {marketingLists.map(list => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Search and Filters */}
        <div className="w-full bg-[#faf9f7] rounded-xl p-4 mb-8 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search templates..."
              className="flex-1 border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="ml-auto p-2 rounded-full hover:bg-red-100 transition">
              <Archive className="text-[#ff6600] w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            {templateFilters.map(f => (
              <button
                key={f.value}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  activeFilter === f.value
                    ? 'bg-[#ff6600] text-white border-[#ff6600]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setActiveFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {/* Templates Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredTemplates.map(tpl => (
            <Card key={tpl.id} className="flex flex-col items-center p-0 overflow-hidden shadow-md border border-gray-200 bg-white">
              <div className="w-full h-72 bg-gray-100 flex items-center justify-center relative">
                {/* Replace with <img src=... /> for real images */}
                <img src={tpl.image} alt={tpl.title} className="object-contain w-full h-full" />
                <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white border border-gray-300 rounded-lg px-6 py-2 font-semibold text-sm shadow hover:bg-gray-50 transition">PREVIEW</button>
              </div>
              <div className="w-full flex flex-col px-4 py-3">
                <div className="font-semibold text-base text-gray-900 mb-1">{tpl.title}</div>
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <span className="mr-2">📅 {tpl.date}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <a href="#" className="text-xs text-blue-600 hover:underline">ARCHIVE</a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
} 