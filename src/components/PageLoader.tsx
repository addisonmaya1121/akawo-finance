import { Loader2Icon } from "lucide-react";

export default function PageLoader() {
  return (
    <main className="flex items-center justify-center py-12">
      <Loader2Icon className="w-12 h-12 animate-spin" />
    </main>
  );
}
