import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function EmptyChart({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
}) {
  return (
    <Card className="p-5 gap-0">
      <div className="mb-4">
        <h3 className="text-[13px] font-medium">{title}</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="flex flex-col items-center justify-center py-10 text-center gap-3 border border-dashed border-border/60 rounded-lg">
        <div className="w-full max-w-[200px] h-24 rounded-md bg-muted/50 flex items-end gap-1 px-2 pb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-border/30"
              style={{ height: `${15 + Math.sin(i * 1.2) * 20 + 20}%` }}
            />
          ))}
        </div>
        <p className="text-[12px] text-muted-foreground">{cta.label}</p>
        <Button asChild variant="outline" size="sm" className="text-[11px]">
          <Link href={cta.href}>
            Conectar <ArrowRight className="size-3 ml-1" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
