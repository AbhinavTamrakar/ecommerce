export interface Banner {
  id: number;
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
  button_text?: string;
  // Admin fields
  name?: string;
  position?: string;
  is_active?: boolean;
  images?: string[];
}