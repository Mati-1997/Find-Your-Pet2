// app/report/actions.ts
"use server";

export async function handleSubmit(prevState: any, formData: FormData) {
  const data = {
    reportType: formData.get("reportType") as string,
    petName: formData.get("petName") as string,
    species: formData.get("species") as string,
    description: formData.get("description") as string,
  };

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

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al enviar el reporte");
    }

    const result = await response.json();
    return {
      success: true,
      message: "Reporte creado exitosamente!",
      redirect: `/report/confirmation/${result.reportId}`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
/*
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
/*
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
} */