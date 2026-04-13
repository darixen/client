// app/loading.tsx
import { SkullLoader } from "@/components/ui/SkullLoader";

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#050505]">
      <SkullLoader />
    </div>
  );
}