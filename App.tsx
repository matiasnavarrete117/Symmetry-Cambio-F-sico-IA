import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import Loader from './components/Loader';
import GeneratedImageGrid from './components/GeneratedImageGrid';
import ApiKeyModal from './components/ApiKeyModal';
import { generateTransformationPack } from './services/geminiService';
import type { GeneratedImage, ImageFile } from './types';

const API_KEY_STORAGE_KEY = 'gemini-api-key-physique-generator';

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<ImageFile[]>([]);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [progressMessage, setProgressMessage] = useState<string>('');
    
    useEffect(() => {
        const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (storedApiKey) {
            setApiKey(storedApiKey);
        }
    }, []);

    const handleSaveApiKey = (key: string) => {
        if (key.trim()) {
            setApiKey(key);
            localStorage.setItem(API_KEY_STORAGE_KEY, key);
        }
    };

    const handleChangeApiKey = () => {
        setApiKey(null);
        localStorage.removeItem(API_KEY_STORAGE_KEY);
    };

    const convertFileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const [header, data] = result.split(',');
                const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
                resolve({ data, mimeType });
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleGenerate = async () => {
        if (!apiKey) {
            setError("Por favor, configura tu API Key antes de generar imágenes.");
            handleChangeApiKey();
            return;
        }
        if (uploadedFiles.length === 0) {
            setError("Por favor, sube al menos una imagen antes de generar.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        try {
            const imagePartsPromises = uploadedFiles.map(imageFile => convertFileToBase64(imageFile.file));
            const resolvedParts = await Promise.all(imagePartsPromises);
            
            const imageParts = resolvedParts.map(part => ({
                inlineData: { data: part.data, mimeType: part.mimeType }
            }));

            const images = await generateTransformationPack(apiKey, imageParts, (message) => {
                setProgressMessage(message);
            });

            if (images.length === 0) {
                setError("No se pudieron generar las imágenes. Por favor, inténtalo de nuevo con otra imagen.");
            } else {
                setGeneratedImages(images);
            }
        } catch (err: any) {
            console.error(err);
             if (err.message && err.message.includes('API key not valid')) {
                setError("Tu API Key no es válida. Por favor, corrígela.");
                handleChangeApiKey();
            } else {
                setError("Ocurrió un error inesperado al generar las imágenes. Revisa la consola para más detalles.");
            }
        } finally {
            setIsLoading(false);
            setProgressMessage('');
        }
    };
    
    const handleStartOver = () => {
        setUploadedFiles([]);
        setGeneratedImages([]);
        setError(null);
        setIsLoading(false);
        setIsDownloading(false);
    };

    const handleDownloadAll = async () => {
        if (generatedImages.length === 0) return;
        setIsDownloading(true);

        try {
            const zip = new JSZip();
            const imagePromises = generatedImages.map(async (image) => {
                const base64Data = image.src.split(',')[1];
                const category = image.category.replace(/\s+/g, '-');
                // Create a unique index within each category to name files
                const fileIndex = generatedImages.filter(img => img.category === image.category).indexOf(image) + 1;
                const filename = `${category}/${category}-${fileIndex}.png`;
                zip.file(filename, base64Data, { base64: true });
            });
            
            await Promise.all(imagePromises);
    
            const content = await zip.generateAsync({ type: 'blob' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'pack-imagenes-ia.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
    
        } catch (err) {
            console.error("Error zipping files:", err);
            setError("Ocurrió un error al crear el archivo .zip.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (!apiKey) {
        return <ApiKeyModal onSave={handleSaveApiKey} />;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <main className="container mx-auto px-4 py-8">
                <Header onManageApiKey={handleChangeApiKey} />

                {error && (
                    <div className="max-w-2xl mx-auto my-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {generatedImages.length > 0 ? (
                     <>
                        <div className="text-center mb-8 flex flex-wrap justify-center gap-4">
                            <button
                                onClick={handleStartOver}
                                className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-300"
                            >
                                Empezar de Nuevo
                            </button>
                            <button
                                onClick={handleDownloadAll}
                                disabled={isDownloading}
                                className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDownloading ? 'Comprimiendo...' : 'Descargar Todo (.zip)'}
                            </button>
                        </div>
                        <GeneratedImageGrid images={generatedImages} />
                     </>
                ) : isLoading ? (
                    <Loader message={progressMessage} />
                ) : (
                    <>
                        <ImageUploader onFilesChange={setUploadedFiles} uploadedFiles={uploadedFiles} />
                        {uploadedFiles.length > 0 && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isLoading}
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Generando...' : 'Generar Pack de 15 Imágenes'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
             <footer className="text-center py-6 text-gray-500 text-sm">
                <p>Desarrollado con React, Tailwind CSS y la API de Gemini.</p>
            </footer>
        </div>
    );
};

export default App;