"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FileText, Search } from "lucide-react"
import { NavBar } from "@/components/Navbar"

interface IngestPageProps {
  onLogout: () => void
}

interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink: string
}

const BACKEDND_URI = import.meta.env.VITE_BACKEND_URI;

export default function IngestPage({ onLogout }: IngestPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [files, setFiles] = useState<DriveFile[]>([])
  const [processingStatus, setProcessingStatus] = useState("")
  const { toast } = useToast()
  const navigate = useNavigate()

  const fetchDriveFiles = async () => {
    setIsLoading(true)
    setProcessingStatus("Fetching files from Google Drive...")

    try {
      const accessToken = localStorage.getItem("google_access_token")

      if (!accessToken) {
        throw new Error("No access token found")
      }

      // Fetch text files from Google Drive
      const response = await fetch(
        "https://www.googleapis.com/drive/v3/files?q=mimeType='text/plain' or mimeType='text/markdown'&fields=files(id,name,mimeType,webViewLink)",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch files from Google Drive")
      }

      const data = await response.json()
      setFiles(data.files || [])

      if (data.files && data.files.length > 0) {
        setProcessingStatus(`Found ${data.files.length} text files. Processing...`)
        await processFiles(data.files)
      } else {
        setProcessingStatus("No text files found in your Google Drive.")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error fetching files:", error)
      toast({
        title: "Error fetching files",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
      setIsLoading(false)
    }
  }

  const processFiles = async (files: DriveFile[]) => {
    try {
      setProcessingStatus("Creating embeddings and storing in Pinecone...")

      const accessToken = localStorage.getItem("google_access_token")

      // For each file, fetch content and send to backend for processing
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setProcessingStatus(`Processing file ${i + 1}/${files.length}: ${file.name}`)

        const contentResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (!contentResponse.ok) {
          throw new Error(`Failed to fetch content for file: ${file.name}`)
        }

        const content = await contentResponse.text()

        const ingestResponse = await fetch(`${BACKEDND_URI}/ingest`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            fileId: file.id,
            fileName: file.name,
            content,
            webViewLink: file.webViewLink,
          }),
        })


        if (!ingestResponse.ok) {
          throw new Error(`Failed to process file: ${file.name}`)
        }
      }

      setProcessingStatus("All files processed successfully!")
      toast({
        title: "Processing complete",
        description: `Successfully processed ${files.length} files`,
      })

      setTimeout(() => {
        navigate("/search")
      }, 2000)
    } catch (error) {
      console.error("Error processing files:", error)
      toast({
        variant: "default",
        title: "Error processing files",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar onLogout={onLogout} />

      <div className="container mx-auto py-10">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">File Ingestion</CardTitle>
            <CardDescription>Fetch and process your Google Drive text files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to fetch text files from your Google Drive and process them for search. This will
                only access text (.txt) and markdown (.md) files.
              </p>

              {files.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Found Files ({files.length})</h3>
                  <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                    <ul className="space-y-1">
                      {files.map((file) => (
                        <li key={file.id} className="text-sm flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center space-x-2 mt-4 p-4 border rounded-md bg-muted/50">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <p className="text-sm">{processingStatus}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button className="w-full" onClick={fetchDriveFiles} disabled={isLoading}>
              {isLoading ? "Processing..." : "Fetch & Process Files"}
            </Button>

            {files.length > 0 && !isLoading && (
              <Button variant="outline" className="w-full" onClick={() => navigate("/search")}>
                <Search className="h-4 w-4 mr-2" />
                Go to Search
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

