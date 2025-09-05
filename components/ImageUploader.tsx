import React, { useCallback, useState } from 'react';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
    onFilesChange: React.Dispatch<React.SetStateAction<ImageFile[]>>;
    uploadedFiles: ImageFile[];
}

const MAX_FILES = 6;

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesChange, uploadedFiles }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files).map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            onFilesChange(prevFiles => 
                [...prevFiles, ...newFiles].slice(0, MAX_FILES)
            );
        }
        event.target.value = ''; // Allow re-uploading the same file
    };

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            const files = Array.from(event.dataTransfer.files)
                .filter(file => file.type.startsWith('image/'))
                .map(file => ({ file, preview: URL.createObjectURL(file) }));
            onFilesChange(prevFiles => 
                [...prevFiles, ...files].slice(0, MAX_FILES)
            );
            event.dataTransfer.clearData();
        }
    }, [onFilesChange]);

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (uploadedFiles.length < MAX_FILES) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleRemoveFile = (fileName: string) => {
        onFilesChange(prevFiles => prevFiles.filter(f => f.file.name !== fileName));
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                onDrop={uploadedFiles.length < MAX_FILES ? handleDrop : (e) => { e.preventDefault(); }}
                onDragOver={handleDragEnter}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${isDragging ? 'border-purple-500 bg-gray-800' : 'border-gray-600'} ${uploadedFiles.length >= MAX_FILES ? 'cursor-not-allowed bg-gray-800' : 'hover:border-purple-400'}`}
            >
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploadedFiles.length >= MAX_FILES}
                />
                <label htmlFor="file-upload" className={uploadedFiles.length >= MAX_FILES ? 'cursor-not-allowed' : 'cursor-pointer'}>
                    <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {uploadedFiles.length >= MAX_FILES ? (
                             <p className="mt-2 text-gray-400">Has alcanzado el límite de {MAX_FILES} imágenes.</p>
                        ) : (
                            <>
                                <p className="mt-2 text-gray-400">
                                    Arrastra y suelta tus imágenes aquí, o <span className="font-semibold text-purple-400">haz clic para seleccionar</span>.
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Puedes subir hasta {MAX_FILES} imágenes de referencia. ({uploadedFiles.length}/{MAX_FILES})</p>
                            </>
                        )}
                    </div>
                </label>
            </div>

            {uploadedFiles.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-300">Imágenes Cargadas:</h3>
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {uploadedFiles.map((imageFile, index) => (
                            <div key={index} className="relative group">
                                <img src={imageFile.preview} alt={`preview ${index}`} className="w-full h-32 object-cover rounded-lg" />
                                <button
                                    onClick={() => handleRemoveFile(imageFile.file.name)}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;