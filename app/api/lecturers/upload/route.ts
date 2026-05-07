// app/api/lecturers/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const folderSlug = formData.get('folder_slug') as string  // e.g. "usmaan_haqqani"
    const type       = formData.get('type') as string         // "image" or "documents"

    if (!folderSlug || !type) {
      return NextResponse.json({ error: 'folder_slug and type are required' }, { status: 400 })
    }

    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // detail_files/lecturer/usmaan_haqqani/image  OR  /documents
    const uploadDir = path.join(process.cwd(), 'detail_files', 'lecturer', folderSlug, type)
    await mkdir(uploadDir, { recursive: true })

    const savedFiles: string[] = []

    for (const file of files) {
      const bytes  = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const filePath = path.join(uploadDir, safeName)
      await writeFile(filePath, buffer)
      savedFiles.push(safeName)
    }

    return NextResponse.json({
      success: true,
      saved: savedFiles,
      path: `detail_files/lecturer/${folderSlug}/${type}/`,
    })
  } catch (error: any) {
    console.error('[UPLOAD] Error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}