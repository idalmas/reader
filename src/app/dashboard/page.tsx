export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Your RSS Feeds</h2>
          {/* Feed list will go here */}
          <div className="text-gray-500">No feeds added yet</div>
          
          <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            Add New Feed
          </button>
        </div>
      </main>
    </div>
  );
} 