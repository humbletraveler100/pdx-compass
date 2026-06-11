'use client';

import { useRouter } from 'next/navigation';

export default function RewardsTermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f0fdf4] p-4 font-sans pb-12">
      {/* Navigation Header */}
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center">
        <button onClick={() => router.back()} className="text-sm font-bold text-yellow-100 hover:underline">← Back</button>
        <h1 className="text-lg font-bold tracking-widest text-center flex-1">Raffle Rules</h1>
        <a href="/" className="text-sm font-bold text-white hover:underline">Home</a>
      </nav>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border-t-4 border-[#164e63] space-y-6 text-gray-800">
        
        <div className="text-center border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-extrabold text-[#164e63] mb-1">🎁 Monthly Reward Drawing</h2>
          <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Official Terms & Conditions</p>
        </div>

        {/* Introduction */}
        <p className="text-sm leading-relaxed text-gray-700">
          To foster local resilience, connection, and grassroots civic health, The Humble Travelers Foundation hosts a monthly drawing. Unlike standard marketplaces, this system explicitly incentivizes both direct mutual aid and community engagement. Every contribution builds a healthier neighborhood.
        </p>

        {/* Point Matrix Section */}
        <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
          <h3 className="font-bold text-[#164e63] text-base mb-3 flex items-center gap-2">⭐ How to Earn Engagement Stars</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
              <div>
                <p className="font-bold text-gray-800">Complete a Mutual Aid Task</p>
                <p className="text-xs text-gray-500">Fulfilling a verified request for help (Food, Repairs, Transportation, Pet Care, etc.).</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full text-xs whitespace-nowrap">+3 Stars</span>
            </div>

            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
              <div>
                <p className="font-bold text-gray-800">Participate in Town Square Polls</p>
                <p className="text-xs text-gray-500">Casting an official vote on community initiatives and neighborhood surveys.</p>
              </div>
              <span className="bg-blue-100 text-blue-800 font-extrabold px-3 py-1 rounded-full text-xs whitespace-nowrap">+1 Star</span>
            </div>

            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
              <div>
                <p className="font-bold text-gray-800">Contribute to Discussions</p>
                <p className="text-xs text-gray-500">Posting replies, feedback, or brainstorm details within Town Square threads.</p>
              </div>
              <span className="bg-purple-100 text-purple-800 font-extrabold px-3 py-1 rounded-full text-xs whitespace-nowrap">+1 Star</span>
            </div>
          </div>
        </div>

        {/* Detailed Rules List */}
        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <div>
            <h4 className="font-bold text-gray-900 mb-1">1. Automatic Entry Calculation</h4>
            <p>Neighbors do not need to purchase tickets. Every Engagement Star collected across the platform acts as an entry into the monthly baseline drawing. For example, earning 7 stars yields 7 drawing entries, scaling your overall drawing weight.</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-1">2. Safety & Verification Standards</h4>
            <p>Physical tasks must be marked resolved by both parties before star allocations are approved. Submitting malicious, false, or abusive submissions to manipulate drawing weights will trigger immediate account suspension and point forfeiture under our Safety Standards.</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-1">3. Non-Transactional Policy</h4>
            <p>Points, stars, and drawing mechanics do not possess real-world monetary value, cannot be traded, transferred, or cashed out. Rewards are structured purely as celebratory community milestones funded via charity resources.</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-1">4. Winner Distribution & Logistics</h4>
            <p>Drawings are run automatically by the digital Raffle Manager on the final day of each calendar month. Winners will be contacted securely via their registered email address and showcased publicly inside the community Spotlight board.</p>
          </div>
        </div>

        {/* Footer closing statement */}
        <div className="border-t border-gray-100 pt-4 text-center">
          <p className="text-xs text-gray-400 font-medium">
            © 2026 The Humble Travelers Foundation • Portland, Oregon
          </p>
        </div>

      </div>
    </div>
  );
}
