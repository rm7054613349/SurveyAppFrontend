import { Routes, Route,Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import AdminDashboard from '../pages/AdminDashboard';
import CreateQuestion from '../pages/CreateQuestion';
import ViewQuestions from '../pages/ViewQuestions';
import ShowReport from '../pages/ShowReport';
import SendReport from '../pages/SendReport';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import OpenSurvey from '../pages/OpenSurvey';
import ReadyPage from '../pages/ReadyPage';
import SurveyForm from '../pages/SurveyForm';
import ThankYou from '../pages/ThankYou';
import UserProfile from '../pages/UserProfile'; 
import ContactUs from '../pages/ContactUs';
import Media from '../pages/Media'
import { GoogleOAuthProvider } from '@react-oauth/google';
import IntranetHome from '../Intranet/Home'
import IntranetAdmin from '../Intranet/IntranetAdmin';
import Announcements from '../Intranet/Announcement';
import AllAnnouncements from '../Intranet/AllAnnouncements';
import Announcementform from '../Intranet/components/AnnouncementForm';


function AppRoutes() {

 
  // const Announcements = () => <div>Announcements Page</div>;
  // const Events = () => <div>Events Page</div>;
  // const DataCenter = () => <div>Data Center Page</div>;


  return (
    
    <Routes>
      {/* Public Routes */}
      <Route  path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin Routes */}
      {/* <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      /> */}
      {/* <Route
        path="/admin/create-question"
        element={
          <ProtectedRoute allowedRole="admin">
            <CreateQuestion />
          </ProtectedRoute>
        }
      /> */}
      {/* <Route
        path="/admin/view-questions"
        element={
          <ProtectedRoute allowedRole="admin">
            <ViewQuestions />
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/admin/show-report"
        element={
          <ProtectedRoute allowedRole="admin">
            <ShowReport />
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/admin/send-report"
        element={
          <ProtectedRoute allowedRole="admin">
            <SendReport />
          </ProtectedRoute>
        }
      /> */}

      {/* Employee Routes */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRole="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/employee/open-survey"
        element={
          <ProtectedRoute allowedRole="employee">
            <OpenSurvey />
          </ProtectedRoute>
        }
      /> */}
      {/* <Route
        path="/employee/ready"
        element={
          <ProtectedRoute allowedRole="employee">
            <ReadyPage />
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/employee/survey"
        element={
          <ProtectedRoute allowedRole="employee">
            <SurveyForm />
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/employee/thank-you"
        element={
          <ProtectedRoute allowedRole="employee">
            <ThankYou />
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/employee/show-report"
        element={
          <ProtectedRoute allowedRole="employee">
            <ShowReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/create-question"
        element={
          <ProtectedRoute allowedRole="admin">
            <CreateQuestion />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/view-questions"
        element={
          <ProtectedRoute allowedRole="admin">
            <ViewQuestions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report/:subsectionId"
        element={
          <ProtectedRoute allowedRole="admin">
            <ShowReport />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/send-report"
        element={
          <ProtectedRoute allowedRole="admin">
            <SendReport />
          </ProtectedRoute>
        }
      />

      {/* Employee Routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRole="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/open-survey"
        element={
          <ProtectedRoute allowedRole="employee">
            <OpenSurvey />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/ready"
        element={
          <ProtectedRoute allowedRole="employee">
            <ReadyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/survey/:subsectionId"
        element={
          <ProtectedRoute allowedRole="employee">
            <SurveyForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/thank-you/:subsectionId"
        element={
          <ProtectedRoute allowedRole="employee">
            <ThankYou />
          </ProtectedRoute>
        }
      />
      
       <Route path="/contact" element={<ContactUs />} />
        {/* Protected Routes */}
         <Route 
         path="/Intranet/Home" 
         element={
         <ProtectedRoute allowedRole={["employee","admin"]}>
            <IntranetHome />
          </ProtectedRoute>
         } />


         
       <Route path="/media" element={<Media />} />
      <Route path="/employee/survey" element={<SurveyForm />} />
        <Route path="/subsections/:sectionId" element={<SurveyForm />} />
        <Route path="/thank-you/:subsectionId" element={<ThankYou />} />
        <Route path="/profile" element={<UserProfile />} />


        {/* IntranetAdmin */}
          <Route path="/intranet-admin" element={<IntranetAdmin />} />
          {/* <Route path="/announcements" element={<Announcements />} />
          {/* <Route path="/events" element={<Events />} /> */}
          {/* <Route path="/data-center" element={<DataCenter />} /> */} 

        <Route 
         path="/employee/announcements" 
         element={
         <ProtectedRoute allowedRole={["employee"]}>
            <Announcements />
          </ProtectedRoute>
         } />


         <Route 
         path="/employee/all-announcements" 
         element={
         <ProtectedRoute allowedRole={["employee"]}>
            <AllAnnouncements />
          </ProtectedRoute>
         } />

        
        {/* announcement form */}
          <Route 
         path="/admin/announcementsform" 
         element={
         <ProtectedRoute allowedRole={["admin"]}>
            <Announcementform/>
          </ProtectedRoute>
         } />



      {/* Fallback Route */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
   
  );
}
export default AppRoutes;