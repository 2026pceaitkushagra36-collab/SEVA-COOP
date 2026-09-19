
import Link from "next/link";

const services = [
  {
    icon: "🔧",
    title: "Home Repairs",
    description:
      "Connect with trusted local workers for everyday repairs.",
  },
  {
    icon: "⚡",
    title: "Electrical",
    description:
      "Find skilled electricians available in your area.",
  },
  {
    icon: "🚰",
    title: "Plumbing",
    description:
      "Get reliable plumbing help from nearby workers.",
  },
  {
    icon: "🪚",
    title: "Carpentry",
    description:
      "Find local carpenters for furniture and home projects.",
  },
];

const tools = [
  {
    icon: "🛠️",
    name: "Power Drill",
    category: "Power Tools",
    status: "Available",
  },
  {
    icon: "🪜",
    name: "Extension Ladder",
    category: "Home Tools",
    status: "Available",
  },
  {
    icon: "🔨",
    name: "Hammer Set",
    category: "Hand Tools",
    status: "Available",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#17211b]">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-[#e4e8e3] bg-[#f7f8f5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#176b45] text-xl font-bold text-white">
              S
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">
                SEVA-COOP
              </div>

              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-gray-500">
                Community Powered
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a
              href="#services"
              className="transition hover:text-[#176b45]"
            >
              Services
            </a>

            <a
              href="#tools"
              className="transition hover:text-[#176b45]"
            >
              Tool Library
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-[#176b45]"
            >
              How It Works
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden px-4 py-2 text-sm font-semibold md:block">
              Sign In
            </button>

            <button className="rounded-xl bg-[#176b45] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125638]">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfe2d6] bg-[#edf7f1] px-4 py-2 text-sm font-medium text-[#176b45]">
              <span className="h-2 w-2 rounded-full bg-[#2e9d68]" />
              Built for stronger local communities
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl">
              Local skills.
              <br />
              Shared resources.
              <br />
              <span className="text-[#176b45]">
                Stronger communities.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              SEVA-COOP connects people with trusted local service providers
              and makes shared tools accessible within their community.
            </p>

            {/* SEARCH */}
            <div className="mt-8 rounded-2xl border border-[#dfe5df] bg-white p-2 shadow-[0_12px_40px_rgba(23,33,27,0.08)]">
              <div className="grid gap-2 md:grid-cols-[1fr_180px_auto]">
                <div className="flex items-center gap-3 rounded-xl bg-[#f7f8f5] px-4 py-3">
                  <span className="text-lg">⌕</span>

                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                    placeholder="What service do you need?"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-[#f7f8f5] px-4 py-3">
                  <span className="text-lg">📍</span>

                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                    placeholder="PIN code"
                  />
                </div>

                <button className="rounded-xl bg-[#176b45] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#125638]">
                  Find Help
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-5 text-sm text-gray-500">
              <span>✓ PIN-code based discovery</span>
              <span>✓ Verified workers</span>
              <span>✓ Shared tools</span>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="relative hidden lg:block">
            <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-[#dceee3] blur-3xl" />

            <div className="relative rounded-[2rem] border border-[#dfe5df] bg-white p-5 shadow-[0_25px_70px_rgba(23,33,27,0.12)]">
              <div className="rounded-3xl bg-[#edf5ef] p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Nearby services
                    </p>

                    <h3 className="mt-1 text-xl font-bold">
                      Your community
                    </h3>
                  </div>

                  <div className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#176b45] shadow-sm">
                    PIN 3020XX
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {[
                    ["🔧", "Home Repair", "2.1 km"],
                    ["⚡", "Electrical", "3.4 km"],
                    ["🚰", "Plumbing", "1.8 km"],
                  ].map(([icon, name, distance]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f4f0] text-xl">
                          {icon}
                        </div>

                        <div>
                          <p className="font-semibold">{name}</p>

                          <p className="text-xs text-gray-500">
                            Verified provider
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-medium text-gray-500">
                        {distance}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-[#176b45] p-5 text-white">
                  <p className="text-sm opacity-80">
                    Community availability
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    24+ providers
                  </p>

                  <p className="mt-1 text-xs opacity-70">
                    available around your area
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-[#e4e8e3] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-8 md:grid-cols-4">
          {[
            ["500+", "Community Members"],
            ["120+", "Verified Workers"],
            ["40+", "Shared Tools"],
            ["15+", "Service Categories"],
          ].map(([number, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-[#176b45]">
                {number}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section
        id="services"
        className="mx-auto max-w-7xl px-6 py-24"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#176b45]">
            Local services
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight">
            Help is closer than you think.
          </h2>

          <p className="mt-4 text-gray-600">
            Discover skilled people around your area and get everyday tasks
            done through your local community.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="group rounded-3xl border border-[#e0e5e0] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#b8d4c3] hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf7f1] text-2xl">
                {service.icon}
              </div>

              <h3 className="mt-6 text-lg font-bold">
                {service.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {service.description}
              </p>

              <button className="mt-6 text-sm font-semibold text-[#176b45]">
                Explore →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="bg-[#17211b] text-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#8dd3ac]">
              Simple by design
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight">
              From a need to a solution in three steps.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              [
                "01",
                "Tell us what you need",
                "Choose a service, describe your requirement and enter your area PIN code.",
              ],
              [
                "02",
                "Get matched locally",
                "SEVA-COOP finds relevant workers and resources available around your area.",
              ],
              [
                "03",
                "Get it done",
                "Connect, complete the task and strengthen your local community.",
              ],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-3xl border border-white/10 bg-white/5 p-7"
              >
                <span className="text-sm font-bold text-[#8dd3ac]">
                  {number}
                </span>

                <h3 className="mt-8 text-xl font-bold">
                  {title}
                </h3>

                <p className="mt-3 leading-7 text-white/60">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOL LIBRARY */}
      <section
        id="tools"
        className="mx-auto max-w-7xl px-6 py-24"
      >
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#176b45]">
              Tool library
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight">
              Share more. Buy less.
            </h2>

            <p className="mt-4 max-w-xl text-gray-600">
              Access tools shared by your community instead of purchasing
              equipment you only need occasionally.
            </p>
          </div>

          <button className="w-fit rounded-xl border border-[#d9dfd9] bg-white px-5 py-3 text-sm font-semibold transition hover:border-[#176b45]">
            Explore Tool Library →
          </button>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="rounded-3xl border border-[#e0e5e0] bg-white p-6"
            >
              <div className="flex h-36 items-center justify-center rounded-2xl bg-[#f1f4f0] text-6xl">
                {tool.icon}
              </div>

              <div className="mt-5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{tool.name}</h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {tool.category}
                  </p>
                </div>

                <span className="rounded-full bg-[#edf7f1] px-3 py-1 text-xs font-semibold text-[#176b45]">
                  {tool.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#dceee3] px-8 py-14 md:px-14">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Your skills can make a difference.
              </h2>

              <p className="mt-3 text-gray-600">
                Join your local network, share your skills or make community
                resources available to others.
              </p>
            </div>

            <button className="w-fit shrink-0 rounded-xl bg-[#176b45] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125638]">
              Join SEVA-COOP
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e4e8e3] bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="text-lg font-bold">
              SEVA-COOP
            </div>

            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-500">
              A community-powered platform connecting local skills,
              services and shared resources.
            </p>
          </div>

          <div>
            <p className="font-semibold">Platform</p>

            <div className="mt-4 space-y-3 text-sm text-gray-500">
              <p>Services</p>
              <p>Tool Library</p>
              <p>How It Works</p>
            </div>
          </div>

          <div>
            <p className="font-semibold">Support</p>

            <div className="mt-4 space-y-3 text-sm text-gray-500">
              <p>Help Center</p>
              <p>Privacy</p>
              <p>Terms</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#e4e8e3]">
          <div className="mx-auto max-w-7xl px-6 py-5 text-xs text-gray-500">
            © 2026 SEVA-COOP. Built for stronger communities.
          </div>
        </div>
      </footer>
    </main>
  )
}