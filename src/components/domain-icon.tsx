interface DomainIconProps {
  domain: string;
  className?: string;
}

function getInitial(domain: string): string {
  return domain.trim().charAt(0).toUpperCase() || "?";
}

export function DomainIcon({ domain, className = "h-4 w-4" }: DomainIconProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-sm bg-muted text-[10px] font-semibold uppercase text-muted-foreground ${className}`}
    >
      {getInitial(domain)}
    </span>
  );
}
