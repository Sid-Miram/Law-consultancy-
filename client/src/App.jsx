import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import LegalBookPage from './pages/LegalBookPage.jsx';
import ScheduleMeetPage from './pages/ScheduleMeetPage.jsx';
import ConsultationPage from './pages/ConsultationPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import PageTransitionHandler from './components/PageTransitionHandler.jsx';

const globalStyles = `
  /* For content transitions */
  .page-content {
    min-height: 100vh;
    padding-top: 80px; /* Adjust based on navbar height */
    will-change: transform, opacity;
  }
  
  /* For smoother animations */
  * {
    box-sizing: border-box;
  }
  
  html, body {
    overflow-x: hidden;
  }
  
  /* Make sure content elements are transition-ready */
  .page-content > * {
    will-change: transform, opacity;
  }
  
  /* Overlay styles for transitions */
  .page-transition-overlay,
  .split-overlay-top,
  .split-overlay-bottom {
    pointer-events: none;
  }
`;


function App() {
  return (
    <Router>
       <style>{globalStyles}</style>
      {/* Page transition wrapper */}
      <PageTransitionHandler>
      <Routes>
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/legal-book" element={<LegalBookPage />} />
          <Route path="/schedule-meet" element={<ScheduleMeetPage />} />
          <Route path="/consultation" element={<ConsultationPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
      </PageTransitionHandler>
    </Router>
  );
}

export default App;