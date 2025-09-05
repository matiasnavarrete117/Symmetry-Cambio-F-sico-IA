
export type ImageCategory = 'Desnutrido' | 'Sobrepeso' | 'Musculado';

export interface GeneratedImage {
  src: string;
  prompt: string;
  category: ImageCategory;
}

export interface ImageFile {
  file: File;
  preview: string;
}
