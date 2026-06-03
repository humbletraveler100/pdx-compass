'use client';

import { useRouter } from 'next/navigation';

export default function LegalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 font-sans pb-12">
      <nav className="bg-[#164e63] text-white p-4 shadow-md rounded-xl mb-6 flex justify-between items-center sticky top-4">
        <button onClick={() => router.back()} className="text-sm font-bold text-[#fcd34d] hover:underline">← Back</button>
        <h1 className="text-lg font-bold tracking-widest text-center flex-1">Legal Agreements</h1>
        <div className="w-12"></div>
      </nav>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-8 text-gray-800">
        
        {/* TERMS OF SERVICE */}
        <section>
          <h2 className="text-2xl font-extrabold text-[#164e63] border-b-2 border-[#0f766e] pb-2 mb-4">Terms of Service</h2>
          <div className="space-y-4 text-sm leading-relaxed">
            <div>
              <h3 className="font-bold text-lg mb-1">1. Acceptance of Terms</h3>
              <p>By accessing or using PDX Community Compass (the "Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must immediately cease use of the Platform.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">2. User Accounts and Eligibility</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must be at least 18 years of age to use this Platform.</li>
                <li>You agree to provide true, accurate, and complete information during registration and are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You may maintain only one account. Account sharing is strictly prohibited.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">3. Code of Conduct and Content Restrictions</h3>
              <p className="mb-2">Users must not engage in any of the following activities:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Offering illegal, unsafe, or hazardous services (e.g., unauthorized medical advice, unlicensed trades).</li>
                <li>Harassing, stalking, or discriminating against other community members.</li>
                <li>Uploading, posting, or sharing content that infringes upon third-party intellectual property rights.</li>
                <li>Using the Platform to solicit financial transactions, except in explicitly permitted exchange frameworks.</li>
                <li><strong>Strict Prohibition on Financial Transactions:</strong> Using the Platform to solicit, offer, or accept money, charges, fees, tips, or monetary compensation of any sort is strictly prohibited. All exchanges must be purely skill-based or barter-based.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">4. Community Guidelines and Liability</h3>
              <p>PDX Community Compass acts solely as a venue to connect users. We do not verify the skills, qualifications, or backgrounds of our users. All exchanges are conducted at your own risk. You agree to indemnify and hold harmless PDX Community Compass from any claims, damages, or liabilities arising out of your interactions with other users.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">5. Termination</h3>
              <p>We reserve the right to suspend or terminate your account at any time, without notice, if we suspect a violation of these Terms or for any other reason deemed necessary for community safety.</p>
            </div>
          </div>
        </section>

        {/* PRIVACY POLICY */}
        <section>
          <h2 className="text-2xl font-extrabold text-[#164e63] border-b-2 border-[#0f766e] pb-2 mb-4">Privacy Policy</h2>
          <div className="space-y-4 text-sm leading-relaxed">
            <div>
              <h3 className="font-bold text-lg mb-1">1. Information We Collect</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account Data:</strong> Name, email address, password.</li>
                <li><strong>Profile Data:</strong> Skills you offer, skills you request, and your bio.</li>
                <li><strong>Location Data:</strong> City, neighborhood, or general geo-location (used strictly to match you with nearby neighbors).</li>
                <li><strong>Communication Data:</strong> Messages exchanged through the Platform's messaging system.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">2. How We Use Your Information</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Match you with users possessing the skills you desire.</li>
                <li>Facilitate in-app communication and scheduling.</li>
                <li>Send you notifications regarding swap requests, matches, and platform updates.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">3. Data Sharing and Third Parties</h3>
              <p className="mb-2">We do not sell or rent your personal information to third parties. We may only share your data with:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Other registered users (e.g., your general profile information to facilitate a connection).</li>
                <li>Service providers (e.g., hosting providers, messaging APIs) acting on our behalf.</li>
                <li>Legal authorities, if required to comply with applicable laws or protect user safety.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">4. Data Security and Retention</h3>
              <p>We implement industry-standard administrative, physical, and electronic safeguards to protect your personal information. We retain your data only as long as your account remains active or as needed to provide you with our services.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">5. Your Rights</h3>
              <p>You may access, update, or delete your personal information at any time by accessing your account settings.</p>
            </div>
          </div>
        </section>

        {/* LEGAL NOTICE */}
        <section>
          <h2 className="text-2xl font-extrabold text-[#164e63] border-b-2 border-[#0f766e] pb-2 mb-4">Legal Notice / Disclaimer</h2>
          <div className="space-y-4 text-sm leading-relaxed">
            <div>
              <h3 className="font-bold text-lg mb-1">1. Publisher Information</h3>
              <p>PDX Community Compass is operated and maintained by The Humble Travelers Foundation, a 501(c)(3) nonprofit organization located in Portland OR.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">2. Contact Information</h3>
              <p>Email: info@humbletravelers.org<br/>Mailing Address: 9715 SE Powell Blvd Portland OR 97266</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">3. Intellectual Property</h3>
              <p>The design, text, graphics, and underlying software code are the property of The Humble Travelers Foundation and are protected by applicable copyright and trademark laws. Unauthorized reproduction is strictly prohibited.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">4. Disclaimer of Warranties</h3>
              <p>The Platform and its contents are provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied. We do not guarantee that the Platform will be error-free, secure, or uninterrupted. PDX Community Compass is not responsible for any financial losses, scams, or unauthorized monetary transactions conducted privately between users in violation of these Terms.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">5. Limitation of Liability</h3>
              <p>To the fullest extent permitted by law, The Humble Travelers Foundation shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of the Platform or any skill-exchange session arranged between users.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">6. Absolute Prohibition of Monetary Exchanges</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Zero-Money Policy:</strong> Under no circumstances shall any user charge, request, or accept money, fees, processing costs, or tips for skills rendered on this Platform.</li>
                <li><strong>Out-of-Platform Transactions:</strong> You agree not to move communications off the Platform to arrange cash or digital payments (e.g., Venmo, CashApp, PayPal).</li>
                <li><strong>Account Termination:</strong> Any attempt to involve financial transactions will result in an immediate, permanent ban from the Platform without warning.</li>
                <li><strong>Reporting Obligation:</strong> You agree to immediately report any user who requests money or fees to Platform administration.</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
