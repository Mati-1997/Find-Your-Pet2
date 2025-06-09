import { createClient } from "./client"

export class StorageService {
  private supabase = createClient()

  async uploadPetImage(file: File, petId: string): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${petId}-${Date.now()}.${fileExt}`
    const filePath = `pets/${fileName}`

    const { error: uploadError } = await this.supabase.storage.from("pet-images").upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = this.supabase.storage.from("pet-images").getPublicUrl(filePath)

    return data.publicUrl
  }

  async uploadUserAvatar(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-avatar.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Delete existing avatar if it exists
    await this.supabase.storage.from("user-avatars").remove([filePath])

    const { error: uploadError } = await this.supabase.storage.from("user-avatars").upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = this.supabase.storage.from("user-avatars").getPublicUrl(filePath)

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
