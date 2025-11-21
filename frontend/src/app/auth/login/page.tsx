import { Suspense } from 'react';
import Login from './Login';

export default async function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />
    </Suspense>
  );
}
