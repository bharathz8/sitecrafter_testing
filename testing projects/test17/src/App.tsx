import { Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import ShowcasePage from '@/pages/ShowcasePage';
import InteractiveExperiencePage from '@/pages/InteractiveExperiencePage';
import ContactPage from '@/pages/ContactPage';
import NotFoundPage from '@/pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/showcase" element={<ShowcasePage />} />
        <Route path="/experience/:id" element={<InteractiveExperiencePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;