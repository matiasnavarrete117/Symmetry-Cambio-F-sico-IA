
import React from 'react';
import { GeneratedImage, ImageCategory } from '../types';

interface GeneratedImageGridProps {
    images: GeneratedImage[];
}

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


const CategorySection: React.FC<{ title: string; images: GeneratedImage[] }> = ({ title, images }) => {
    
    const handleDownload = (src: string, filename: string) => {
        const link = document.createElement('a');
        link.href = src;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {images.map((image, index) => (
                    <div key={index} className="relative group overflow-hidden rounded-lg shadow-lg bg-gray-800">
                        <img src={image.src} alt={image.prompt} className="w-full h-full object-cover aspect-square transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="text-xs text-gray-200 px-2">{image.prompt}</p>
                             <button
                                onClick={() => handleDownload(image.src, `${title.replace(/\s+/g, '-')}-${index + 1}.png`)}
                                className="absolute bottom-3 right-3 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-colors"
                                aria-label="Descargar imagen"
                                title="Descargar imagen"
                            >
                                <DownloadIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const GeneratedImageGrid: React.FC<GeneratedImageGridProps> = ({ images }) => {
    const malnourishedImages = images.filter(img => img.category === 'Desnutrido');
    const overweightImages = images.filter(img => img.category === 'Sobrepeso');
    const muscularImages = images.filter(img => img.category === 'Musculado');

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <CategorySection title="Complexión Desnutrida" images={malnourishedImages} />
            <CategorySection title="Complexión con Sobrepeso" images={overweightImages} />
            <CategorySection title="Complexión Musculada" images={muscularImages} />
        </div>
    );
};

export default GeneratedImageGrid;