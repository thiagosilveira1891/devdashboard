export function ProblemSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 border-t border-[#27272a]">
      <div className="text-center mb-16">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#fafafa]">
          Your developer data is scattered
        </h2>
        <p className="text-[14px] text-[#a1a1aa] mt-3 max-w-lg mx-auto">
          Commits in one place, coding hours in another, problems somewhere else.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { name: "GitHub", desc: "Commits · PRs · Repos", color: "#fafafa", bg: "bg-[#24292e]/30" },
          { name: "LeetCode", desc: "Problems · Contests", color: "#f59e0b", bg: "bg-[#f59e0b]/10" },
          { name: "Codeforces", desc: "Rating · Submissions", color: "#38bdf8", bg: "bg-[#38bdf8]/10" },
          { name: "WakaTime", desc: "Hours · Languages", color: "#7c3aed", bg: "bg-[#7c3aed]/10" },
        ].map((p) => (
          <div
            key={p.name}
            className="rounded-lg border border-[#27272a] bg-[#111113] p-4 text-center"
          >
            <div className={`inline-flex size-8 rounded items-center justify-center ${p.bg} mb-2`}>
              <span className="text-[13px] font-mono font-semibold" style={{ color: p.color }}>
                {p.name === "GitHub" ? "GH" : p.name === "LeetCode" ? "LC" : p.name === "Codeforces" ? "CF" : "WT"}
              </span>
            </div>
            <p className="text-[13px] font-medium text-[#fafafa]">{p.name}</p>
            <p className="text-[11px] text-[#a1a1aa] mt-0.5">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Arrow + unified */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="size-1.5 rounded-full bg-[#7c3aed]"
              style={{ opacity: 0.3 + i * 0.3 }}
            />
          ))}
        </div>
        <div className="rounded-lg border border-[#7c3aed]/30 bg-[#7c3aed]/5 px-6 py-4 flex items-center gap-3">
          <div className="size-7 rounded bg-[#7c3aed]/15 border border-[#7c3aed]/30 grid place-items-center">
            <span className="text-[#7c3aed] text-[10px] font-mono font-semibold">{"</>"}</span>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#fafafa]">Developer Dashboard</p>
            <p className="text-[12px] text-[#a1a1aa]">One profile. Complete history.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
