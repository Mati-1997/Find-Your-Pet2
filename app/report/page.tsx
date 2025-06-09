"use client";

import { ArrowLeft, Camera, MapPin, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Server Action (puede moverse a un archivo aparte como actions.ts)
async function handleSubmit(prevState: any, formData: FormData) {
  "use server";
  
  // 1. Obtener datos del formulario
  const data = {
    reportType: formData.get("reportType") as string,
    petName: formData.get("petName") as string,
    species: formData.get("species") as string,
    description: formData.get("description") as string,
    // images: formData.getAll("petImages") as File[], // Descomentar si subes imágenes
  };

  // 2. Validación básica
  if (!data.petName || !data.description) {
    return {
      success: false,
      message: "Nombre y descripción son obligatorios",
      errors: {
        petName: !data.petName ? "Campo requerido" : "",
        description: !data.description ? "Campo requerido" : "",
      },
    };
  }

  // 3. Procesamiento de imágenes (opcional)
  /*
  const imageUrls = [];
  for (const image of data.images) {
    const buffer = await image.arrayBuffer();
    // Subir a Cloudinary, AWS S3, etc.
  }
  */

  // 4. Enviar a tu API o base de datos
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        // images: imageUrls, // Si subiste imágenes
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al enviar el reporte");
    }

    return {
      success: true,
      message: "Reporte creado exitosamente!",
      redirect: `/report/confirmation/${(await response.json()).reportId}`,
    };
  } catch (error) {
    console.error("Submission error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

// Componente para el botón de submit con estado de loading
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      className="w-full" 
      size="lg"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? "Enviando..." : "Publicar reporte"}
    </Button>
  );
}

export default function ReportPage() {
  const [state, formAction] = useFormState(handleSubmit, null);
  const router = useRouter();

  // Efecto para redireccionar si el envío fue exitoso
  useEffect(() => {
    if (state?.success && state.redirect) {
      toast.success(state.message);
      router.push(state.redirect);
    } else if (state?.success) {
      toast.success(state.message);
    } else if (state?.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header y otros componentes... */}

      <main className="flex-1 container px-4 py-6">
        <form action={formAction} className="space-y-6">
          {/* Campo de tipo de reporte */}
          <div className="space-y-2">
            <Label>Tipo de reporte</Label>
            <RadioGroup 
              name="reportType" 
              defaultValue="lost" 
              className="grid grid-cols-2 gap-4"
            >
              <Label
                htmlFor="lost"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="lost" id="lost" className="sr-only" />
                <span className="text-sm font-medium">Mascota perdida</span>
              </Label>
              <Label
                htmlFor="found"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="found" id="found" className="sr-only" />
                <span className="text-sm font-medium">Mascota encontrada</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Campo de nombre */}
          <div className="space-y-2">
            <Label htmlFor="petName">Nombre de la mascota</Label>
            <Input 
              name="petName" 
              id="petName" 
              placeholder="Nombre" 
              required
            />
            {state?.errors?.petName && (
              <p className="text-sm text-red-500">{state.errors.petName}</p>
            )}
          </div>

          {/* Campo de especie */}
          <div className="space-y-2">
            <Label htmlFor="species">Especie</Label>
            <RadioGroup 
              name="species" 
              defaultValue="dog" 
              className="grid grid-cols-3 gap-2"
            >
              {/* Opciones de especie... */}
            </RadioGroup>
          </div>

          {/* Campo de descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea 
              name="description" 
              id="description" 
              placeholder="Color, raza, características distintivas..." 
              required
              minLength={20}
            />
            {state?.errors?.description && (
              <p className="text-sm text-red-500">{state.errors.description}</p>
            )}
          </div>

          {/* Botón de envío */}
          <SubmitButton />
        </form>
      </main>
    </div>
  );
}