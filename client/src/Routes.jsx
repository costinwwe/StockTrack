// Routes.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import About from './pages/About';
import Account from './pages/Account';
import Admin from './pages/Admin';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AttributeEditor from './pages/AttributeEditor'; 
import BlockLibrary from './pages/BlockLibrary';
import Blog from './pages/Blog';
import CollaborationHub from './pages/CollaborationHub';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import GetPro from './pages/GetPro';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/Nf';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Projects from './pages/Projects';
import Register from './pages/Register';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Terms from './pages/Terms';
import Tutorial from './pages/Tutorial';
import UserProfile from './pages/UserProfile';
import Workspace from './pages/Workspace';
import Profile from './pages/Profile';
import Project from './pages/Project';

import Navbar from './components/Navbar';
import Strink from './components/Strink';
import BlogPost from './components/BlogPost';
import BlogEditor from './components/BlogEditor';
import DiagnosticProject from './pages/DianogstickProject';

const RoutesComponent = () => {
  return (
    <Router>
      <Navbar />
      <Strink></Strink>
      <Routes>
        <Route path="/project/:id" element={<Project/>} />
        <Route path="/about" element={<About />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin" element={<Admin />} />
        <Route path= "/dashboard" element={<AnalyticsDashboard />} />
        <Route path="/blog" element={<Blog />} />
        {/* Updated route to support nested routes in Collaboration Hub */}
        <Route path="/collaboration-hub/*" element={<CollaborationHub />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/get-pro" element={<GetPro />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/user-profile" element={<UserProfile />} />  
        <Route path='/profile' element={<Profile />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/blog/new" element={<BlogEditor />} />
        <Route path="/blog/edit/:id" element={<BlogEditor />} />
      </Routes>
    </Router>
  );
};

export default RoutesComponent;