import { Providers } from './components/Providers';
import AppController from './components/AppController';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export default function Home() {
  return (
    <ErrorBoundary>
      <Providers>
        <AppController />
      </Providers>
    </ErrorBoundary>
  );
}
