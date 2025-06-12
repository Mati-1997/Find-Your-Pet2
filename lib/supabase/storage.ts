import { createClient } from "./client"

export class StorageService {
  private supabase = createClient()

  async uploadPetImage(file: File, petId: string): Promise<string> {
    try {
      console.log("Starting pet image upload for petId:", petId)

      const fileExt = file.name.split(".").pop()
      const fileName = `${petId}-${Date.now()}.${fileExt}`
      const filePath = `pets/${fileName}`

      console.log("Uploading to path:", filePath)

      // Check if bucket exists
      const { data: buckets, error: bucketError } = await this.supabase.storage.listBuckets()
      if (bucketError) {
        console.error("Error listing buckets:", bucketError)
        throw new Error("No se pudo verificar el almacenamiento")
      }

      const petImagesBucket = buckets.find((bucket) => bucket.id === "pet-images")
      if (!petImagesBucket) {
        throw new Error("El bucket 'pet-images' no existe. Contacta al administrador.")
      }

      // Upload file
      const { data, error: uploadError } = await this.supabase.storage.from("pet-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw new Error(`Error al subir imagen: ${uploadError.message}`)
      }

      console.log("Upload successful:", data)

      // Get public URL
      const { data: urlData } = this.supabase.storage.from("pet-images").getPublicUrl(filePath)

      console.log("Public URL:", urlData.publicUrl)
      return urlData.publicUrl
    } catch (error: any) {
      console.error("Storage service error:", error)
      throw error
    }
  }

  async uploadUserAvatar(file: File, userId: string): Promise<string> {
    try {
      console.log("Starting avatar upload for userId:", userId)

      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      console.log("Uploading avatar to path:", filePath)

      // Check if bucket exists
      const { data: buckets, error: bucketError } = await this.supabase.storage.listBuckets()
      if (bucketError) {
        console.error("Error listing buckets:", bucketError)
        throw new Error("No se pudo verificar el almacenamiento")
      }

      const avatarsBucket = buckets.find((bucket) => bucket.id === "user-avatars")
      if (!avatarsBucket) {
        throw new Error("El bucket 'user-avatars' no existe. Contacta al administrador.")
      }

      // Upload file
      const { data, error: uploadError } = await this.supabase.storage.from("user-avatars").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) {
        console.error("Avatar upload error:", uploadError)
        throw new Error(`Error al subir avatar: ${uploadError.message}`)
      }

      console.log("Avatar upload successful:", data)

      // Get public URL
      const { data: urlData } = this.supabase.storage.from("user-avatars").getPublicUrl(filePath)

      console.log("Avatar public URL:", urlData.publicUrl)
      return urlData.publicUrl
    } catch (error: any) {
      console.error("Avatar storage service error:", error)
      throw error
    }
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

  // Método para verificar el estado del storage
  async checkStorageStatus(): Promise<{ buckets: any[]; policies: any[] }> {
    try {
      const { data: buckets, error: bucketError } = await this.supabase.storage.listBuckets()
      if (bucketError) throw bucketError

      // Intentar listar archivos en cada bucket para verificar permisos
      const bucketTests = await Promise.all(
        buckets.map(async (bucket) => {
          try {
            const { data, error } = await this.supabase.storage.from(bucket.id).list("", { limit: 1 })
            return { bucket: bucket.id, canList: !error, error: error?.message }
          } catch (e: any) {
            return { bucket: bucket.id, canList: false, error: e.message }
          }
        }),
      )

      return { buckets: bucketTests, policies: [] }
    } catch (error: any) {
      console.error("Error checking storage status:", error)
      throw error
    }
  }
}

export const storageService = new StorageService()
