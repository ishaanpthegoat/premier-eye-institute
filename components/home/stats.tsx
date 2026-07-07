import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { stats, site } from "@/lib/site";

export function Stats() {
  return (
    <section id="stats" className="bg-ink text-white">
      <div className="mx-auto max-w-[1100px] px-5 py-20 sm:px-8 md:py-28">
        <Reveal className="mb-14 text-center">
          <p className="eyebrow eyebrow-centered mb-3.5 justify-center">
            Trusted since {site.founded}
          </p>
          <h2 className="font-heading text-[clamp(28px,4vw,46px)] font-medium tracking-[-0.5px] text-white">
            Ten years in Creedmoor.
          </h2>
        </Reveal>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.09} className="text-center">
              <dd className="font-heading text-[clamp(44px,6vw,72px)] font-medium leading-none text-accent tabular-nums">
                <CountUp
                  value={s.value}
                  suffix={"suffix" in s ? s.suffix : ""}
                  decimals={"decimals" in s ? s.decimals : 0}
                />
              </dd>
              <dt className="mt-2.5 text-[13.5px] tracking-[0.4px] text-[#b8afa8]">
                {s.label}
              </dt>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
