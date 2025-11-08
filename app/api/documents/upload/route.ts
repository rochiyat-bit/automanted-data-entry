import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { auth } from '@/lib/auth'
import { DocumentModel } from '@/lib/db/models'
import { config } from '@/lib/config'
import { generateUniqueFilename } from '@/lib/utils'
import { processDocument } from '@/lib/processing/document-processor'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!config.upload.allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type. Allowed types: ${config.upload.allowedTypes.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > config.upload.maxFileSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size: ${config.upload.maxFileSize / 1024 / 1024}MB`,
        },
        { status: 400 }
      )
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), config.upload.uploadDir)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name)
    const filePath = join(uploadDir, filename)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create document record in database
    const document = await DocumentModel.create({
      userId: session.user.id,
      filename: file.name,
      filePath,
      fileType: file.type,
      status: 'uploaded',
    })

    // Trigger background processing
    // In production, this should be a queue job
    processDocument(document.id, session.user.id).catch(error => {
      console.error('Background processing error:', error)
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: document.id,
          filename: document.filename,
          fileType: document.fileType,
          status: document.status,
          uploadedAt: document.uploadedAt,
        },
        message: 'File uploaded successfully. Processing in background...',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload file',
      },
      { status: 500 }
    )
  }
}

// Configure body parser
export const config = {
  api: {
    bodyParser: false,
  },
}
