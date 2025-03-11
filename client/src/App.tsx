import { useState } from 'react'
import { Button } from "@/components/ui/button"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleGoogleLogin = async () => {
    // TODO: Implement Google OAuth login
    window.location.href = 'http://localhost:3000/api/auth/google'
  }

  const handleFileSearch = async () => {
    // TODO: Implement semantic search
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Google Drive Semantic Search</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Search your Drive files using natural language
          </p>
        </div>

        {!isLoggedIn ? (
          <div className="flex justify-center">
            <Button onClick={handleGoogleLogin} size="lg">
              Login with Google
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button variant="outline">
                Fetch Drive Files
              </Button>
              <Button>
                Generate Embeddings
              </Button>
            </div>

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search your files..."
                className="flex-1 px-4 py-2 border rounded-md"
              />
              <Button onClick={handleFileSearch}>
                Search
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
