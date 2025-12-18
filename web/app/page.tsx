import { Providers } from './components/Providers';
import Jackpot from './components/Jackpot';

export default function Home() {
  return (
    <Providers>
      <div className="min-h-screen py-8 lg:py-12">
        <Jackpot />
      </div>
    </Providers>
  );
}
