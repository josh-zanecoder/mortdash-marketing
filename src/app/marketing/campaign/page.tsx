'use client'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
export default function CampaignPage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#fafafa]">
      <div className="w-full max-w-7xl mx-auto mt-12 mb-12">
        <div className="shadow-sm border rounded-xl bg-white p-8 sm:p-14" style={{ minHeight: "700px" }}>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Campaign</h1>
            <p className="mt-2 text-lg text-gray-600">Build and launch campaigns.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 mt-8">
            {/* Preview Section */}
            <div className="w-full md:w-1/2">
              <div className="text-xl font-semibold mb-4">Preview</div>
              <div className="border rounded-xl bg-white flex items-center justify-center h-96 min-h-[350px] text-center">
                <span className="text-gray-500 text-3xl font-semibold">No Template Selected</span>
              </div>
            </div>
            {/* Build Campaign Form */}
            <div className="w-full md:w-1/2">
              <div className="text-xl font-semibold mb-4">Build Your Campaign</div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sender</label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Select Account Executive</option>
                    {/* Add options dynamically as needed */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Marketing List</label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">SELECT A MARKETING LIST</option>
                    {/* Add options dynamically as needed */}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 