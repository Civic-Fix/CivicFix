import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Issues from './pages/Issues.jsx'
import IssueDetail from './pages/IssueDetail.jsx'
import Team from './pages/Team.jsx'
import Map from './pages/Map.jsx'
import Reports from './pages/Reports.jsx'
import RequestAccess from './pages/RequestAccess.jsx'
import PublicIssue from './pages/PublicIssue.jsx'
import AppLayout from './layouts/AppLayout.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/request-access" element={<RequestAccess />} />
        <Route path="/share/issues/:issueId" element={<PublicIssue />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/issues/:issueId" element={<IssueDetail />} />
          <Route path="/team" element={<Team />} />
          <Route path="/map" element={<Map />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
