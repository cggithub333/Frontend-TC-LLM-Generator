export function AuthDivider({ text = "or continue with" }: { text?: string }) {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-background px-3 text-muted-foreground font-medium">
          {text}
        </span>
      </div>
    </div>
  );
}
