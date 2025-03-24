import { Skeleton } from '@/components/ui/skeleton'

export default function ExpensesLoading() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-9 w-[100px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <div className="rounded-md border">
        <div className="h-24 flex items-center justify-center">
          <Skeleton className="h-5 w-[200px]" />
        </div>
      </div>
    </div>
  )
} 