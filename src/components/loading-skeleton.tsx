import { Skeleton } from "./skeleton";

export function LoadingSkeleton() {
  return (
    <div className="bg-white flex flex-col gap-2">
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </div>
  );
}
