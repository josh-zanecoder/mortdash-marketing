'use client'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
export default function CampaignPage() {
  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-12 flex flex-col items-center">
          {/* Title and Subtitle */}
          <div className="w-full flex flex-col items-start">
            <h1 className="text-4xl font-extrabold tracking-tight text-left">Campaign</h1>
            <p className="mt-2 text-lg text-gray-600 text-left">Build and launch campaigns.</p>
          </div>
          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-12 mt-10 w-full items-start">
            {/* Preview Section */}
            <div className="w-full md:w-1/2 flex flex-col">
              <div className="text-xl font-semibold mb-4">Preview</div>
              <div className="border-2 border-dashed border-orange-300 bg-orange-50 rounded-xl flex items-center justify-center h-96 min-h-[350px] text-center">
                <span>
                  <span className="flex justify-center">
                    {/* Badge for "No Template Selected" */}
                    <span className="inline-block">
                      {/* If you have a Badge component, use it here: */}
                      {/* <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-100">No Template Selected</Badge> */}
                      {/* If not, fallback to styled span: */}
                      <span className="px-4 py-2 rounded-full border border-orange-300 bg-orange-100 text-orange-700 font-semibold text-lg">
                        No Template Selected
                      </span>
                    </span>
                  </span>
                </span>
              </div>
            </div>
            {/* Divider */}
            <div className="hidden md:block h-96 min-h-[350px] border-l border-gray-300 mx-2"></div>
            <div className="block md:hidden w-full border-t border-gray-300 my-8"></div>
            {/* Build Campaign Form */}
            <div className="w-full md:w-1/2 flex flex-col">
              <div className="text-xl font-semibold mb-4">Build Your Campaign</div>
              <div className="flex flex-col gap-6 border rounded-xl bg-white h-96 min-h-[350px] justify-center p-8 shadow">
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
    </main>
  );
} 