import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-serif text-primary-light">
      <Head>
        <title>PDX Community Compass</title>
      {/* Navigation */}
      <nav className="bg-primary text-white p-4 shadow-md">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <img
            src="https://www.humbletravelers.org/assets/images/image04.jpg?v=9dd789db"
            alt="Humble Travelers Logo"
            className="h-10 w-10 rounded-full bg-white object-cover"
          />
          <h1 className="text-xl font-bold tracking-widest">PDX Compass</h1>
          <a href="/login" className="bg-[#fcd34d] text-[#164e63] px-4 py-2 rounded-full font-bold text-sm">
            Sign In
          </a>
        </div>
      </nav>
      </Head>

      {/* Navigation */}
      <nav className="bg-primary text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <img 
            src="https://www.humbletravelers.org/assets/images/thtf-compass-logo.png" 
            alt="Humble Travelers Logo" 
            className="h-10 w-10 rounded-full bg-white p-1"
          />
          <h1 className="text-xl font-bold tracking-wide">PDX Compass</h1>
             <a href="/login" className="bg-[#fcd34d] text-[#164e63] px-4 py-2 rounded-full font-bold">
            Sign In
          </a>

        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-secondary p-8 text-center border-b-4 border-secondary-mint">
        <h2 className="text-3xl font-bold text-primary mb-3">
          We Are All Travelers Shaping Stronger Communities Together
        </h2>
        <p className="text-lg text-primary-light mb-4">
          A Portland-based 501(c)(3) fostering inclusion, bridging divides, and building capacity through grassroots engagement.
        </p>
        <button className="bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-lg w-full max-w-xs hover:bg-primary-light">
          Ask for Help
        </button>
      </header>

      {/* Main Dashboard / Features */}
      <main className="p-4 max-w-md mx-auto space-y-6 mt-4">
        
        {/* Safety Disclaimer */}
        <div className="bg-secondary-apricot p-4 rounded-lg shadow-sm text-sm border-l-4 border-primary">
          <strong>Safety Notice:</strong> The Humble Travelers Foundation facilitates community connections but does not supervise individual services. Please exercise reasonable judgment and prioritize personal safety.
        </div>

        {/* Feature Cards */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-md border-t-4 border-primary text-center">
            <h3 className="font-bold text-lg mb-1">Action Board</h3>
            <p className="text-xs text-gray-600">Volunteer & Connect</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md border-t-4 border-secondary-peach text-center">
            <h3 className="font-bold text-lg mb-1">Aid Exchange</h3>
            <p className="text-xs text-gray-600">Borrow & Assist</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md border-t-4 border-secondary-mint text-center">
            <h3 className="font-bold text-lg mb-1">Community Ideas</h3>
            <p className="text-xs text-gray-600">Propose & Vote</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md border-t-4 border-primary-light text-center">
            <h3 className="font-bold text-lg mb-1">Spotlight</h3>
            <p className="text-xs text-gray-600">Local Heroes</p>
          </div>
        </section>

        {/* Community Feed Preview */}
        <section className="mt-8">
          <h3 className="text-2xl font-bold text-primary mb-4 border-b-2 border-secondary pb-2">Neighborhood Feed</h3>
          
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-100">
            <span className="bg-secondary-mint text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Volunteer Need</span>
            <h4 className="font-bold text-lg mt-2">Sidewalk Brigade – Chalk Kindness Event</h4>
            <p className="text-sm text-gray-600 mt-1">St. Johns • Sunday 2pm • Need: 5 volunteers</p>
            <button className="mt-3 text-sm font-bold text-primary border border-primary px-4 py-2 rounded hover:bg-secondary">Offer Help</button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-100">
            <span className="bg-secondary-peach text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Borrow Support</span>
            <h4 className="font-bold text-lg mt-2">Needs to borrow a pressure washer</h4>
            <p className="text-sm text-gray-600 mt-1">Alberta Arts • When: Saturday (flexible) • 2 hours</p>
            <button className="mt-3 text-sm font-bold text-primary border border-primary px-4 py-2 rounded hover:bg-secondary">Message</button>
          </div>
        </section>

      </main>
    </div>
  );
}

