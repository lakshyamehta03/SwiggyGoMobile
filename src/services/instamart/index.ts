export * from './types';
export * from './instamart-client';
export * from './instamart-service';

export interface InstamartProduct {
  id: string;
  name: string;
  brand: string;
  variations: InstamartVariation[];
}
