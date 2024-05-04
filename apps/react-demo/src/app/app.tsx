import { Route, Routes, Link } from 'react-router-dom';
import GettingStarted from './getting-started';
import Examples from './examples';
import Welcome from './welcome';

export function App() {
  return (
    <>
    <header className="sticky top-0 w-full z-10 flex p-2 items-center justify-between bg-slate-100 border-b">
      <Link to="/">
        <h1>zod2form (z2f)</h1>
      </Link>

      <nav className="flex gap-2">
        <Link to="/getting-started">Getting Started</Link>  
        <Link to="/examples">Examples</Link>  
      </nav>
    </header>

     <main className="p-2">
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/getting-started" element={<GettingStarted />} />
        <Route path="/examples" element={<Examples />} />
      </Routes>
     </main>
    </>
  );
}

export default App;
