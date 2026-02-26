import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { ProjectsProvider } from '@/contexts/projects-context'
import { TasksProvider } from '@/contexts/tasks-context'
import { SprintsProvider } from '@/contexts/sprints-context'
import { ThemeProvider } from '@/contexts/theme-context'
import { ProtectedRoute } from '@/components/protected-route'
import LoginPage from '@/pages/login'
import DashboardPage from '@/pages/dashboard'
import ProjectPage from '@/pages/project'
import { Loader2 } from 'lucide-react'

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ProjectsProvider>
            <TasksProvider>
              <SprintsProvider>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <AuthRedirect>
                      <LoginPage />
                    </AuthRedirect>
                  }
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/project/:id"
                  element={
                    <ProtectedRoute>
                      <ProjectPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              </SprintsProvider>
            </TasksProvider>
          </ProjectsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
