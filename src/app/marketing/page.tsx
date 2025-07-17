'use client'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Trash2, Users, List, SlidersHorizontal, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useState } from "react";
import ContactsTab from "./tabs/ContactsTab";
import ListsTab from "./tabs/ListsTab";
import CampaignTab from "./tabs/CampaignTab";
import TrackingTab from "./tabs/TrackingTab";

const tabData = [
  {
    label: "Contacts",
    value: "contacts",
    icon: Users,
    columns: [
      "First name",
      "Last name",
      "Title",
      "Company",
      "Has Account Executive",
      "Account Executive",
    ],
    rows: [
      ["John", "Doe", "Manager", "Acme Corp", "Yes", "Alice Smith"],
      ["Jane", "Smith", "Developer", "Beta LLC", "No", "-"],
      ["Sam", "Wilson", "Designer", "Gamma Inc", "Yes", "Bob Lee"],
    ],
  },
  {
    label: "Lists",
    value: "lists",
    icon: List,
    columns: ["List name", "Audience", "Count", "Actions"],
    rows: [
      ["Newsletter", "All Users", "1200"],
      ["VIP Clients", "Premium", "50"],
    ],
  },
  {
    label: "Campaign",
    value: "campaign",
    icon: SlidersHorizontal,
    columns: ["Campaign Name", "Status", "Sent"],
    rows: [
      ["Summer Sale", "Scheduled", "2024-06-10"],
      ["Product Launch", "Draft", "-"],
    ],
  },
  {
    label: "Tracking",
    value: "tracking",
    icon: MapPin,
    columns: ["Campaign", "Opens", "Clicks"],
    rows: [
      ["Summer Sale", "800", "120"],
      ["Product Launch", "-", "-"],
    ],
  },
];

export default function MarketingPage() {
  const [contactsPage, setContactsPage] = useState(1);
  const contactsPageCount = 1; // Static for now, update as needed
  const [listsPage, setListsPage] = useState(1);
  const listsPageCount = 1; // Static for now, update as needed
  const [activeTab, setActiveTab] = useState("contacts");
  return (
    <div className="max-w-5xl mx-auto min-h-screen flex flex-col py-0 px-2">
      <Card className="shadow-sm border rounded-xl flex flex-col flex-1 min-h-0 mt-8 mb-8">
        <CardHeader>
          <CardTitle className="text-4xl font-extrabold tracking-tight">Marketing</CardTitle>
          <CardDescription className="mt-2 text-lg">
            Build Targeted Marketing Lists, Launch Effective Campaigns, and Track Performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 min-h-0">
          <Tabs defaultValue="contacts" className="w-full flex flex-col flex-1 min-h-0" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              {tabData.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2 text-lg font-bold data-[state=active]:text-[#ff6600]">
                    <Icon className="size-6 data-[state=active]:text-[#ff6600]" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {tabData.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="flex flex-col flex-1 min-h-0">
                {tab.value === "contacts" && (
                  <ContactsTab columns={tab.columns} rows={tab.rows} />
                )}
                {tab.value === "lists" && (
                  <ListsTab columns={tab.columns} rows={tab.rows} />
                )}
                {tab.value === "campaign" && (
                  <CampaignTab />
                )}
                {tab.value === "tracking" && (
                  <TrackingTab columns={tab.columns} rows={tab.rows} />
                )}
              </TabsContent>
            ))}
          </Tabs>
          {/* Pagination at the bottom, only for active tab */}
          <div className="flex justify-end mt-auto pt-4">
            {activeTab === "contacts" && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={e => { e.preventDefault(); setContactsPage(p => Math.max(1, p - 1)); }}
                      aria-disabled={contactsPage === 1}
                    />
                  </PaginationItem>
                  {[...Array(contactsPageCount)].map((_, idx) => (
                    <PaginationItem key={idx}>
                      <PaginationLink
                        href="#"
                        isActive={contactsPage === idx + 1}
                        onClick={e => { e.preventDefault(); setContactsPage(idx + 1); }}
                      >
                        {idx + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={e => { e.preventDefault(); setContactsPage(p => Math.min(contactsPageCount, p + 1)); }}
                      aria-disabled={contactsPage === contactsPageCount}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
            {activeTab === "lists" && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={e => { e.preventDefault(); setListsPage(p => Math.max(1, p - 1)); }}
                      aria-disabled={listsPage === 1}
                    />
                  </PaginationItem>
                  {[...Array(listsPageCount)].map((_, idx) => (
                    <PaginationItem key={idx}>
                      <PaginationLink
                        href="#"
                        isActive={listsPage === idx + 1}
                        onClick={e => { e.preventDefault(); setListsPage(idx + 1); }}
                      >
                        {idx + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={e => { e.preventDefault(); setListsPage(p => Math.min(listsPageCount, p + 1)); }}
                      aria-disabled={listsPage === listsPageCount}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
