const FEATURES = [
  {
    id: "heatmap",
    title: "Unified Activity Timeline",
    description:
      "A single contribution graph combining commits, coding hours, and problem solving across all your platforms. See your entire developer life in one heatmap.",
    preview: (
      <div className="rounded-lg border border-[#27272a] bg-[#111113] p-4">
        <p className="text-[10px] text-[#a1a1aa] mb-3">Activity · last 12 weeks</p>
        <div className="grid grid-cols-13 gap-[2px]">
          {Array.from({ length: 84 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-sm"
              style={{
                backgroundColor: ["#161618", "#2e1d5e", "#4c2da8", "#7c3aed", "#a78bfa"][
                  Math.floor(i % 13 < 7 ? (Math.sin(i * 0.7) + 1) * 2 : (Math.cos(i * 0.5) + 1) * 1.2)
                ] ?? "#161618",
                opacity: i % 13 < 7 ? 0.8 : 0.3,
              }}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "analytics",
    title: "Developer Analytics",
    description:
      "Compare periods, find your most productive day, and get automatic insights about your coding patterns.",
    preview: (
      <div className="rounded-lg border border-[#27272a] bg-[#111113] p-4 space-y-3">
        <p className="text-[10px] text-[#a1a1aa]">Weekly activity</p>
        <div className="flex items-end gap-2 h-16">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm bg-[#7c3aed]/60"
                style={{ height: `${[35, 70, 55, 80, 60, 25, 15][i]}%` }}
              />
              <span className="text-[9px] text-[#52525b]">{day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#7c3aed]">
          <span>+34% vs last week</span>
        </div>
      </div>
    ),
  },
  {
    id: "languages",
    title: "Language Distribution",
    description:
      "See which languages you actually use — not just from repos, but from real coding time tracked by WakaTime.",
    preview: (
      <div className="rounded-lg border border-[#27272a] bg-[#111113] p-4 space-y-2">
        {[
          { name: "TypeScript", pct: 44 },
          { name: "Python", pct: 24 },
          { name: "Rust", pct: 14 },
          { name: "Go", pct: 8 },
          { name: "CSS", pct: 5 },
        ].map((l) => (
          <div key={l.name} className="flex items-center gap-2">
            <span className="text-[11px] text-[#fafafa] w-20">{l.name}</span>
            <div className="flex-1 h-1.5 rounded-full bg-[#1c1c1f]">
              <div className="h-full rounded-full bg-[#7c3aed]" style={{ width: `${l.pct}%` }} />
            </div>
            <span className="text-[10px] text-[#52525b] font-mono w-8 text-right">{l.pct}%</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "competitive",
    title: "Competitive Programming",
    description:
      "Track your LeetCode and Codeforces progress side by side. Rating evolution, problems by difficulty, and contest history.",
    preview: (
      <div className="rounded-lg border border-[#27272a] bg-[#111113] p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Easy", value: "167", color: "#22c55e" },
            { label: "Medium", value: "242", color: "#f59e0b" },
            { label: "Hard", value: "31", color: "#ef4444" },
          ].map((d) => (
            <div key={d.label}>
              <p className="font-mono text-[18px] font-semibold text-[#fafafa]">{d.value}</p>
              <p className="text-[10px] text-[#a1a1aa]" style={{ color: d.color }}>{d.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#a1a1aa]">Rating</span>
          <span className="font-mono text-[14px] font-semibold text-[#38bdf8]">1,596</span>
          <span className="text-[10px] text-[#52525b] capitalize">specialist</span>
        </div>
      </div>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-24 border-t border-[#27272a]">
      <div className="text-center mb-16">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#fafafa]">
          Everything in one place
        </h2>
        <p className="text-[14px] text-[#a1a1aa] mt-3">
          Four platforms. One dashboard. Your complete developer profile.
        </p>
      </div>

      <div className="space-y-20">
        {FEATURES.map((feature, i) => (
          <div
            key={feature.id}
            className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
          >
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <h3 className="text-xl font-semibold tracking-tight text-[#fafafa]">
                {feature.title}
              </h3>
              <p className="text-[14px] text-[#a1a1aa] mt-3 leading-relaxed max-w-md">
                {feature.description}
              </p>
            </div>
            <div className={i % 2 === 1 ? "md:order-1" : ""}>
              {feature.preview}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
