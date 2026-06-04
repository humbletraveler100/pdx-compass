'use client';

import { useRouter } from 'next/navigation';

export default function SafetyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 font-sans pb-12">
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center sticky top-4">
        <button onClick={() => router.back()} className="text-sm font-bold text-[#fcd34d] hover:underline">← Back</button>
        <h1 className="text-lg font-bold tracking-widest text-center flex-1">Safety Standards</h1>
        <div className="w-12"></div>
      </nav>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-8 text-gray-800">
        
        <div className="text-center border-b-2 border-[#0f766e] pb-6">
          <h2 className="text-3xl font-extrabold text-[#164e63] mb-2">Community Safety Standards</h2>
          <p className="text-gray-600">The Humble Travelers Foundation is committed to fostering a secure, supportive, and low-risk environment for all neighbors.</p>
        </div>

        <section>
          <h3 className="text-xl font-bold text-[#164e63] mb-3 flex items-center gap-2">🟢 Approved Community Aid</h3>
          <p className="text-sm mb-4">We encourage mutual aid that takes place in public or external spaces. Examples of highly encouraged tasks include:</p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li><strong>Exterior Property Help:</strong> Yard work, gardening, debris removal, or snow shoveling.</li>
            <li><strong>Porch Drop-offs:</strong> Delivering groceries, supplies, or meals with contactless drop-off.</li>
            <li><strong>Neighborhood Action:</strong> Park cleanups, graffiti removal, or distributing community flyers.</li>
            <li><strong>Public Skill Sharing:</strong> Meeting at a library or coffee shop for tutoring, resume review, or language practice.</li>
          </ul>
        </section>

        <section className="bg-red-50 p-6 rounded-xl border border-red-200">
          <h3 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2">🚫 Strictly Prohibited Activities</h3>
          <p className="text-sm text-red-900 mb-4">To protect all users from liability and physical risk, the following activities are strictly banned from the platform. Requests asking for these will be immediately removed:</p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-red-900 font-semibold">
            <li><strong>Entering a Stranger's Home:</strong> No indoor cleaning, indoor repairs, or moving heavy furniture inside a residence.</li>
            <li><strong>Personal Transportation:</strong> No ridesharing, driving neighbors to appointments, or lending out vehicles.</li>
            <li><strong>Emergency Medical Aid:</strong> Do not use this platform for urgent medical needs. Call 911.</li>
            <li><strong>Childcare or Elder Care:</strong> No babysitting or direct caregiving services.</li>
            <li><strong>Financial Exchanges:</strong> As per our Zero-Money Policy, absolutely no cash, Venmo, or digital tips are permitted.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-[#164e63] mb-3">Your Responsibility</h3>
          <p className="text-sm leading-relaxed mb-3">
            PDX Community Compass is a tool to connect neighbors, but you are ultimately responsible for your own safety. Always meet in public first if you are unsure, trust your instincts, and use the "Flag Post" feature if you see a request that violates these standards.
          </p>
          <p className="text-sm leading-relaxed font-bold">
            Violating these safety standards will result in immediate removal from the platform and disqualification from all Volunteer Raffles.
          </p>
        </section>

      </div>
    </div>
  );
}
