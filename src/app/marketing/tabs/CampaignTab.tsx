export default function CampaignTab() {
  return (
    <div className="flex flex-col md:flex-row gap-8 flex-1">
      {/* Preview Section */}
      <div className="flex-1 p-4">
        <div className="text-xl font-semibold mb-4">Preview</div>
        <div className="border rounded-xl bg-white flex items-center justify-center h-80 md:h-full min-h-[300px] text-center">
          <span className="text-gray-500">No Template Selected</span>
        </div>
      </div>
      {/* Build Campaign Form */}
      <div className="w-full md:w-[350px] flex-shrink-0">
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
  );
}
