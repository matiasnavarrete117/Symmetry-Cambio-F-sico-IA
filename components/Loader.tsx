
import React from 'react';

interface LoaderProps {
    message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
            <p className="mt-4 text-lg text-gray-300 font-semibold">{message}</p>
            <p className="mt-2 text-sm text-gray-500">Esto puede tardar unos minutos. Por favor, no cierres esta ventana.</p>
        </div>
    );
};

export default Loader;
