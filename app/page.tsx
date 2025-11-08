export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Automated Data Entry System
        </h1>
        <p className="text-center text-lg text-muted-foreground mb-8">
          Production-grade OCR and AI-powered document processing
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Document Upload</h2>
            <p className="text-sm text-muted-foreground">
              Upload and process multiple document types with drag-and-drop support
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">OCR Processing</h2>
            <p className="text-sm text-muted-foreground">
              Automated text extraction using advanced OCR technology
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">AI Extraction</h2>
            <p className="text-sm text-muted-foreground">
              Intelligent data structuring and categorization with AI
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
