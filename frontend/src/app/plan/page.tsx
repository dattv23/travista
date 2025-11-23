import { Suspense } from 'react';
import InitPlan from './InitPlan';

export default async function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InitPlan />
    </Suspense>
  );
}
