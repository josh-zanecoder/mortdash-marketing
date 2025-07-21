'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { BarChart2, Users, ListTodo, MailOpen, FileText, ArrowLeft } from 'lucide-react';
import { useContactStore } from '@/store/useContactStore';
import { useTrackingStore } from '@/store/useTrackingStore';
import { mortdash_url, mortdash_ae_url } from '@/config/mortdash';
import { useEffect } from 'react';

const marketingLinks = [
  { label: 'Prospect Lists', description: 'Manage potential clients and leads in your pipeline.', href: '/marketing/contacts', icon: <Users className="w-5 h-5 text-slate-500" /> },
  { label: 'Client Lists', description: 'Organize existing clients and customer relationships.', href: '/marketing/contacts', icon: <Users className="w-5 h-5 text-slate-500" /> },
  { label: 'Marketing Only Contacts', description: 'Contacts for marketing campaigns and newsletters.', href: '/marketing/contacts', icon: <Users className="w-5 h-5 text-slate-500" /> },
];



const rateSheets = [
  { name: 'Standard Rate Sheet', lastUpdated: '2024-06-01', link: '#' },
  { name: 'Premium Rate Sheet', lastUpdated: '2024-05-15', link: '#' },
];

export default function DashboardPage() {
  const { 
    marketingContacts, 
    prospects, 
    clients, 
    total,
    fetchContacts, 
    fetchProspects, 
    fetchClients,
    loading: contactsLoading 
  } = useContactStore();

  const {
    dashboardStats,
    fetchDashboardStats,
    loading: statsLoading
  } = useTrackingStore();

  // Calculate actual contact statistics
  const marketingOnly = total;
  const totalProspects = prospects ? prospects.reduce((sum, group) => sum + group.members.length, 0) : 0;
  const totalClients = clients ? clients.reduce((sum, group) => sum + group.members.length, 0) : 0;
  const totalContacts = marketingOnly + totalProspects + totalClients;

  // Fetch data on component mount
  useEffect(() => {
    fetchContacts();
    fetchProspects();
    fetchClients();
    fetchDashboardStats();
  }, [fetchContacts, fetchProspects, fetchClients, fetchDashboardStats]);

  const contactStats = [
    { label: 'Total Contacts', value: totalContacts, color: 'bg-blue-100', icon: <Users className="w-6 h-6 text-blue-600" /> },
    { label: 'Prospects', value: totalProspects, color: 'bg-green-100', icon: <Users className="w-6 h-6 text-green-600" /> },
    { label: 'Clients', value: totalClients, color: 'bg-purple-100', icon: <Users className="w-6 h-6 text-purple-600" /> },
    { label: 'Marketing Only', value: marketingOnly, color: 'bg-orange-100', icon: <Users className="w-6 h-6 text-orange-500" /> },
  ];

  const trackingStats = [
    { label: 'Delivered', value: dashboardStats.delivered, color: 'bg-green-100', icon: <BarChart2 className="w-6 h-6 text-green-600" />, href: '/marketing/tracking' },
    { label: 'Unique Clickers', value: dashboardStats.unique_clickers, color: 'bg-blue-100', icon: <BarChart2 className="w-6 h-6 text-blue-600" />, href: '/marketing/tracking' },
    { label: 'Soft Bounces', value: dashboardStats.soft_bounces, color: 'bg-orange-100', icon: <BarChart2 className="w-6 h-6 text-orange-500" />, href: '/marketing/tracking' },
    { label: 'Hard Bounces', value: dashboardStats.hard_bounces, color: 'bg-gray-200', icon: <BarChart2 className="w-6 h-6 text-gray-500" />, href: '/marketing/tracking' },
    { label: 'Blocked', value: dashboardStats.blocked, color: 'bg-pink-100', icon: <BarChart2 className="w-6 h-6 text-pink-500" />, href: '/marketing/tracking' },
  ];

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-[#fdf6f1] items-center py-16 px-4 gap-8">
      {/* Back to AE Dashboard Button */}
      <div className="w-full max-w-6xl">
        <a 
          href={`${mortdash_ae_url}/account-executive/dashboard`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#ff6600] rounded-lg border-2 border-[#ff6600] hover:bg-[#fff7ed] transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to AE Dashboard
        </a>
      </div>

      {/* Hero Section */}
      <section className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#232323] mb-2 drop-shadow-sm leading-tight">Welcome to Mortdash Marketing</h1>
        <p className="text-lg md:text-xl text-[#6d6d6d] mb-4 font-medium">Build targeted marketing lists, launch effective campaigns, and track performance—all in one place.</p>
      </section>
      {/* Templates & Marketing Ideas Section */}
      <section className="w-full max-w-6xl mb-8">
        <Card className="p-6 shadow-lg border-2 border-[#ffe3d1] bg-white">
          <CardHeader className="flex flex-row items-center gap-2 mb-4">
            <MailOpen className="w-6 h-6 text-[#ff6600]" />
            <CardTitle className="text-2xl font-bold">Templates & Marketing Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/marketing/campaign" className="block group">
                <div className="rounded-lg p-6 shadow-sm border border-slate-200 bg-[#fdf6f1] hover:shadow-md transition h-full flex flex-col justify-between hover:bg-[#fff7ed] hover:scale-[1.02] active:scale-100 duration-150">
                  <div className="flex items-center gap-3 mb-3">
                    <MailOpen className="w-8 h-8 text-[#ff6600]" />
                    <span className="text-xl font-bold text-[#232323] group-hover:underline">New Templates</span>
                  </div>
                  <p className="text-sm text-[#6d6d6d]">Create and send engaging email campaigns to your audience with our professional templates.</p>
                </div>
              </Link>
              <Link href="/email-builder" className="block group">
                <div className="rounded-lg p-6 shadow-sm border border-slate-200 bg-[#fdf6f1] hover:shadow-md transition h-full flex flex-col justify-between hover:bg-[#fff7ed] hover:scale-[1.02] active:scale-100 duration-150">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-8 h-8 text-[#ff6600]" />
                    <span className="text-xl font-bold text-[#232323] group-hover:underline">Quick Tips/Marketing Ideas</span>
                  </div>
                  <p className="text-sm text-[#6d6d6d]">Get inspired with marketing ideas and design beautiful emails with our drag-and-drop builder.</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
      {/* Main Content Row: Marketing + Rate Sheets */}
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Marketing Section */}
        <Link href="/marketing/contacts" className="col-span-2 block group">
          <Card className="p-6 shadow-lg border-2 border-[#ffe3d1] bg-white hover:shadow-xl transition-all duration-200 hover:scale-[1.01] cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-[#ff6600]" />
              <CardTitle className="text-2xl font-bold group-hover:text-[#ff6600] transition-colors">Summary of Contacts</CardTitle>
            </CardHeader>
          <CardContent>
            {/* Contact Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {contactsLoading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-lg p-3 shadow-sm border border-slate-200 bg-white flex flex-col items-center gap-1">
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))
              ) : (
                contactStats.map((stat) => (
                  <div key={stat.label} className={`rounded-lg p-3 shadow-sm border border-slate-200 bg-white flex flex-col items-center gap-1 ${stat.color}`}>
                    {stat.icon}
                    <span className="text-lg font-bold text-[#232323]">{stat.value}</span>
                    <span className="text-xs text-[#6d6d6d] text-center">{stat.label}</span>
                  </div>
                ))
              )}
            </div>
            {/* Contact Lists */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {marketingLinks.map((item) => (
                <div key={item.label} className="block group">
                  <div className="rounded-lg p-4 shadow-sm border border-slate-200 bg-[#fdf6f1] hover:shadow-md transition h-full flex flex-col justify-between hover:bg-[#fff7ed] hover:scale-[1.03] active:scale-100 duration-150">
                    <div className="flex items-center gap-2 mb-1">{item.icon}<span className="font-semibold text-[#232323] group-hover:underline">{item.label}</span></div>
                    <span className="text-xs text-[#6d6d6d] mt-1">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </Link>
        {/* Rate Sheets Section */}
        <Card className="col-span-1 p-6 shadow-lg border-2 border-[#ffe3d1] bg-white flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center gap-2 mb-4">
            <FileText className="w-6 h-6 text-[#ff6600]" />
            <CardTitle className="text-2xl font-bold">Rate Sheets</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 mb-4">
              {rateSheets.map((sheet) => (
                <li key={sheet.name} className="flex flex-col">
                  <span className="font-semibold text-[#232323]">{sheet.name}</span>
                  <span className="text-xs text-[#6d6d6d]">Last updated: {sheet.lastUpdated}</span>
                  <a href={sheet.link} className="text-blue-600 text-xs hover:underline mt-1">View/Download</a>
                </li>
              ))}
            </ul>
            <Link href="#" className="inline-block mt-2 px-4 py-2 bg-[#ff6600] text-white rounded-lg font-semibold shadow hover:bg-[#e65c00] transition text-center">See All Rate Sheets</Link>
          </CardContent>
        </Card>
      </section>
      {/* Stats Section */}
      <section className="w-full max-w-6xl mb-8">
        <Card className="p-6 shadow-lg border-2 border-[#ffe3d1] bg-white">
          <CardHeader className="flex flex-row items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-[#ff6600]" />
              <CardTitle className="text-2xl font-bold">Stats</CardTitle>
            </div>
            <Link href="/marketing/tracking" className="text-sm text-blue-600 hover:underline font-semibold">View Tracking &rarr;</Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {statsLoading ? (
                // Loading skeleton for stats
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="rounded-xl p-5 shadow border border-slate-200 bg-white">
                    <div className="flex flex-col items-center gap-2 animate-pulse">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                      <div className="w-12 h-6 bg-gray-200 rounded"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))
              ) : (
                trackingStats.map((stat) => (
                  <Link href={stat.href} key={stat.label} className="group block cursor-pointer">
                    <div className={`rounded-xl p-5 shadow border border-slate-200 bg-white hover:shadow-md transition flex flex-col items-center gap-2 ${stat.color} hover:scale-105 active:scale-100 duration-150`}>
                      {stat.icon}
                      <span className="text-2xl font-extrabold text-[#232323]">{stat.value}</span>
                      <span className="text-sm text-[#6d6d6d] group-hover:underline">{stat.label}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
