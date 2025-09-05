import { GoogleGenAI, Modality } from "@google/genai";
import { ImageCategory, GeneratedImage } from '../types';

const prompts: { prompt: string; category: ImageCategory }[] = [
    // Desnutrido / Triste
    { prompt: "Plano americano de esta persona con una complexión extremadamente delgada, expresión de profunda tristeza, en una habitación con poca luz.", category: 'Desnutrido' },
    { prompt: "Foto de cintura para arriba de esta persona, muy delgada, con rasgos faciales definidos por la delgadez, mirándose con melancolía en el espejo de un baño descuidado.", category: 'Desnutrido' },
    { prompt: "Esta persona, en un plano medio, mostrando un cuerpo muy delgado con ropa holgada y cara triste, sentado solo en un banco en un parque desolado (al aire libre).", category: 'Desnutrido' },
    { prompt: "Un retrato en plano americano de esta persona, con aspecto frágil y muy delgado, en una sala de estar vacía y desordenada.", category: 'Desnutrido' },
    { prompt: "Fotografía artística en plano americano de esta persona con los huesos de la cara marcados y expresión de tristeza, en su habitación.", category: 'Desnutrido' },

    // Sobrepeso / Triste
    { prompt: "Plano americano de esta persona con un sobrepeso masivo, expresión facial muy triste, sentado en un sofá en una sala de estar, con algunos snacks en la mesa.", category: 'Sobrepeso' },
    { prompt: "Foto de cintura para arriba de esta persona, con un cuerpo extremadamente corpulento, mirándose con desánimo en el espejo de su habitación.", category: 'Sobrepeso' },
    { prompt: "Esta persona, en un plano medio, con un físico notablemente grande y con sobrepeso, pareciendo infeliz mientras come comida chatarra en un banco al aire libre.", category: 'Sobrepeso' },
    { prompt: "Un retrato en plano americano de esta persona con un sobrepeso muy pronunciado y expresión de tristeza, viendo la televisión en una sala de estar poco iluminada.", category: 'Sobrepeso' },
    { prompt: "Fotografía en plano americano de esta persona con una complexión exageradamente robusta y cara de descontento en su habitación.", category: 'Sobrepeso' },

    // Musculado / Feliz
    { prompt: "Plano americano de esta persona sin polera, físico de culturista exageradamente musculoso, sonriendo con confianza en un gimnasio moderno y bien equipado.", category: 'Musculado' },
    { prompt: "Foto de cintura para arriba de esta persona con el torso desnudo, tomándose una selfie sonriendo frente al espejo del gimnasio.", category: 'Musculado' },
    { prompt: "Esta persona sin camiseta en un plano americano, con músculos extremadamente grandes y marcados, riendo mientras entrena al aire libre en un parque de calistenia.", category: 'Musculado' },
    { prompt: "Un retrato en plano americano de esta persona sin polera, mostrando su físico con orgullo y una gran sonrisa en la sala de estar de su casa.", category: 'Musculado' },
    { prompt: "Fotografía de esta persona en plano americano, torso desnudo, con expresión de euforia en el vestuario de un gimnasio después de entrenar.", category: 'Musculado' }
];

const generateSingleImage = async (
    apiKey: string,
    imageParts: { inlineData: { data: string; mimeType: string } }[],
    prompt: string,
    category: ImageCategory
): Promise<GeneratedImage | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [ ...imageParts, { text: prompt } ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                return { src: imageUrl, prompt, category };
            }
        }
        return null;
    } catch (error) {
        console.error(`Error generating image for prompt: "${prompt}"`, error);
        if (error instanceof Error && /API_KEY/.test(error.message)) {
            throw new Error("API key not valid. Please check your API key.");
        }
        return null;
    }
};


const generateImageWithRetries = async (
    apiKey: string,
    imageParts: { inlineData: { data: string; mimeType: string } }[],
    prompt: string,
    category: ImageCategory
): Promise<GeneratedImage | null> => {
    const MAX_ATTEMPTS = 3;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const result = await generateSingleImage(apiKey, imageParts, prompt, category);
            if (result) {
                return result;
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes("API key not valid")) {
                throw error; // No reintentar si la clave es inválida
            }
            console.error(`Attempt ${attempt} failed for prompt: "${prompt}"`, error);
        }

        if (attempt < MAX_ATTEMPTS) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    console.warn(`No se pudo generar la imagen para el prompt: "${prompt}" después de ${MAX_ATTEMPTS} intentos.`);
    return null;
};

export const generateTransformationPack = async (
    apiKey: string,
    imageParts: { inlineData: { data: string; mimeType: string } }[],
    onProgress: (message: string) => void
): Promise<GeneratedImage[]> => {
    const allGeneratedImages: GeneratedImage[] = [];
    const BATCH_SIZE = 5;
    let completedCount = 0;
    const totalImages = prompts.length;

    onProgress("Iniciando proceso de generación...");
    await new Promise(resolve => setTimeout(resolve, 1000));

    for (let i = 0; i < totalImages; i += BATCH_SIZE) {
        const batchPrompts = prompts.slice(i, i + BATCH_SIZE);
        onProgress(`Procesando lote ${Math.floor(i / BATCH_SIZE) + 1} de ${Math.ceil(totalImages / BATCH_SIZE)}...`);
        
        const batchPromises = batchPrompts.map(p => 
            generateImageWithRetries(apiKey, imageParts, p.prompt, p.category)
        );

        const batchResults = await Promise.all(batchPromises);

        for (const result of batchResults) {
            completedCount++;
            if (result) {
                allGeneratedImages.push(result);
            }
            onProgress(`Generando imágenes... (${completedCount}/${totalImages})`);
        }
    }
    
    onProgress(`¡Proceso completado! Se generaron ${allGeneratedImages.length} imágenes.`);
    return allGeneratedImages;
};