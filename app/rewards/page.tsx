'use client';

import { useRouter } from 'next/navigation';

export default function RewardsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 font-sans pb-12">
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center sticky top-4">
        <button onClick={() => router.back()} className="text-sm font-bold text-[#fcd34d] hover:underline">← Back</button>
        <h1 className="text-lg font-bold tracking-widest text-center flex-1">Reward Rules</h1>
        <div className="w-12"></div>
      </nav>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-8 text-gray-800">
        
        <div className="text-center border-b-2 border-[#fcd34d] pb-6">
          <h2 className="text-3xl font-extrabold text-[#164e63] mb-2">🎁 Monthly Reward Drawing Rules</h2>
          <p className="text-gray-600 font-medium">To say thank you to our amazing helpers, every completed help request earns you a chance to win a monthly prize!</p>
        </div>

        <section>
          <h3 className="text-xl font-bold text-[#164e63] mb-2">How to Earn Entries</h3>
          <p className="text-sm leading-relaxed text-gray-700">
            When a neighbor marks your help request as successfully completed, the system submits it to our team. Once approved by an admin, you automatically receive one (1) entry into that month's drawing.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-[#164e63] mb-2">No Limits</h3>
          <p className="text-sm leading-relaxed text-gray-700">
            You can earn multiple entries each month by helping multiple neighbors. However, each unique, completed task counts as only one entry.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-[#164e63] mb-2">Sourced with Love</h3>
          <p className="text-sm leading-relaxed text-gray-700">
            Prizes consist of wonderful in-kind donations given to our parent nonprofit organization. Prizes are randomized, given "as-is," and cannot be exchanged for cash.
          </p>
        </section>

        <section className="bg-orange-50 p-6 rounded-xl border border-orange-200">
          <h3 className="text-xl font-bold text-[#b45309] mb-2">Fair Play</h3>
          <p className="text-sm leading-relaxed text-orange-900 font-semibold">
            Any attempt to rig the system, create fake help requests, or self-approve tasks will result in immediate disqualification from the drawing and a potential ban from the platform.
          </p>
        </section>

      </div>
    </div>
  );
}
