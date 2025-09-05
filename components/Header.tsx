import React from 'react';

interface HeaderProps {
    onManageApiKey: () => void;
}

const KeyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    </svg>
);

const Header: React.FC<HeaderProps> = ({ onManageApiKey }) => {
    return (
        <header className="text-center py-8 px-4 relative">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Generador de Físico IA
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                Sube una imagen de un rostro y observa cómo la IA crea 15 versiones con diferentes complexiones físicas y expresiones.
            </p>
             <button
                onClick={onManageApiKey}
                className="absolute top-4 right-4 flex items-center px-3 py-2 bg-gray-700 text-gray-300 text-sm font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-300"
                title="Cambiar API Key"
            >
                <KeyIcon />
                <span>API Key</span>
            </button>
        </header>
    );
};

export default Header;