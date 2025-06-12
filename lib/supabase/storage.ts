import { createClient } from "./client"

export class StorageService {
  private supabase = createClient()

  async uploadPetImage(file: File, petId: string): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${petId}-${Date.now()}.${fileExt}`
    const filePath = `pets/${fileName}`

    // Make sure the bucket exists and is properly configured
    const { error: uploadError } = await this.supabase.storage.from("pet-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true, // Use upsert to overwrite if file exists
    })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      throw uploadError
    }

    const { data } = this.supabase.storage.from("pet-images").getPublicUrl(filePath)

    console.log("Uploaded image URL:", data.publicUrl)
    return data.publicUrl
  }

  async uploadUserAvatar(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-avatar.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Use upsert to overwrite existing files
    const { error: uploadError } = await this.supabase.storage.from("user-avatars").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      console.error("Avatar upload error:", uploadError)
      throw uploadError
    }

    const { data } = this.supabase.storage.from("user-avatars").getPublicUrl(filePath)

    console.log("Uploaded avatar URL:", data.publicUrl)
    return data.publicUrl
  }

  async uploadAIRecognitionImage(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `ai-recognition/${fileName}`

    const { error: uploadError } = await this.supabase.storage.from("ai-recognition").upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = this.supabase.storage.from("ai-recognition").getPublicUrl(filePath)

    return data.publicUrl
  }

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([filePath])

    if (error) throw error
  }
}

export const storageService = new StorageService()
