"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Search, ExternalLink, FileText, Loader2 } from "lucide-react"
import { NavBar } from "@/components/Navbar"

interface SearchPageProps {
  onLogout: () => void
}

interface SearchResult {
  id: string
  title: string
  driveLink: string
  score: number
}

export default function SearchPage({ onLogout }: SearchPageProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) {
      toast({
        variant: "destructive",
        title: "Empty query",
        description: "Please enter a search query",
      })
      return
    }

    setIsSearching(true)

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      setResults(data.results || [])

      if (data.results.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search query",
        })
      }
    } catch (error) {
      console.error("Search error:", error)
      toast({
        variant: "destructive",
        title: "Search failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar onLogout={onLogout} />

      <div className="container mx-auto py-10">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Search Your Drive Files</CardTitle>
              <CardDescription>Search through your processed Google Drive files using AI</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Enter your search query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Search Results</CardTitle>
                <CardDescription>Found {results.length} matching documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result) => (
                    <div key={result.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <FileText className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-medium">{result.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Relevance score: {(result.score * 100).toFixed(2)}%
                            </p>
                          </div>
                        </div>
                        <a
                          href={result.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-5 w-5" />
                          <span className="sr-only">Open in Google Drive</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

