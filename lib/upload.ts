import { supabase } from './supabase'

export const MAX_FILE_SIZE = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const BUCKET = 'venue-images'

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) return 'Fayl hajmi 5MB dan oshmasligi kerak'
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Faqat JPG, PNG yoki WebP ruxsat etiladi'
  return null
}

async function ensureBucket(): Promise<void> {
  const { data: buckets } = await supabase.storage.listBuckets()
  if (buckets?.some(b => b.id === BUCKET)) return

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: ALLOWED_IMAGE_TYPES,
  })
  if (error && !error.message.includes('already exists')) throw error
}

export async function uploadImage(file: File, path: string): Promise<string | null> {
  const error = validateFile(file)
  if (error) throw new Error(error)

  const ext = file.name.split('.').pop()
  const fileName = `${path}/${Date.now()}.${ext}`

  const { data, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (uploadError?.message?.includes('Bucket not found')) {
    await ensureBucket()
    const { data: retryData, error: retryError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (retryError) throw retryError
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(retryData.path)
    return publicUrl
  }

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
  return publicUrl
}
