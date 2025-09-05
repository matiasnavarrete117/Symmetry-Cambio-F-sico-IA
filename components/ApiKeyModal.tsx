import React, { useState } from 'react';

interface ApiKeyModalProps {
    onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
    const [key, setKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (key.trim()) {
            onSave(key.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-2xl w-full border border-gray-700">
                <h2 className="text-3xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    Configura tu API Key de Gemini
                </h2>
                <p className="text-gray-400 text-center mb-6">
                    Para usar esta aplicación, necesitas tu propia clave de API de Google Gemini. La aplicación la guardará de forma segura en tu navegador.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
                    <input
                        type="password"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="Pega tu API Key aquí..."
                        className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                        required
                        aria-label="API Key de Gemini"
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-300"
                    >
                        Guardar y Empezar
                    </button>
                </form>

                <div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-200">¿Cómo obtener una API Key?</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-400">
                        <li>
                            Ve a{' '}
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:underline font-semibold"
                            >
                                Google AI Studio
                            </a>.
                        </li>
                        <li>Inicia sesión con tu cuenta de Google.</li>
                        <li>Haz clic en <span className="font-semibold text-gray-300">"Create API key in new project"</span>.</li>
                        <li>Copia la clave generada y pégala en el campo de arriba.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
