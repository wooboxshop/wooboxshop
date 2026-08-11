import React from 'react';
import {
  Tag,
  Sparkles,
  Flame,
  Smartphone,
  Laptop,
  Tv,
  Gamepad2,
  Headphones,
  Watch,
  Shirt,
  Footprints,
  Glasses,
  Home,
  Utensils,
  Coffee,
  Dumbbell,
  Heart,
  Smile,
  Star,
  Crown,
  BookOpen,
  Palette,
  Car,
  Plane,
  Gift,
  Briefcase,
  Camera,
  Music,
  Zap,
  TrendingUp,
  Box,
  ShieldCheck,
  Award,
  Percent,
  Video,
  ShoppingBag,
  Scissors,
  Wrench,
  Lightbulb,
  Cpu,
} from 'lucide-react';

export interface CategoryIconOption {
  name: string;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const AVAILABLE_CATEGORY_ICONS: CategoryIconOption[] = [
  { name: 'Tag', label: 'Etiqueta / Geral', category: 'Geral', icon: Tag },
  { name: 'Sparkles', label: 'Achadinhos / Tendência', category: 'Geral', icon: Sparkles },
  { name: 'Flame', label: 'Virais / Em Alta', category: 'Geral', icon: Flame },
  { name: 'ShoppingBag', label: 'Sacola de Compras', category: 'Geral', icon: ShoppingBag },
  { name: 'Percent', label: 'Oferta / Desconto', category: 'Geral', icon: Percent },
  { name: 'Zap', label: 'Relâmpago / Promo', category: 'Geral', icon: Zap },
  { name: 'Gift', label: 'Presentes & Datas', category: 'Geral', icon: Gift },
  { name: 'Star', label: 'Destaques & Favoritos', category: 'Geral', icon: Star },
  { name: 'Crown', label: 'Premium & Luxo', category: 'Geral', icon: Crown },
  { name: 'Award', label: 'Top Avaliados', category: 'Geral', icon: Award },
  { name: 'TrendingUp', label: 'Mais Vendidos', category: 'Geral', icon: TrendingUp },
  { name: 'ShieldCheck', label: 'Produtos Verificados', category: 'Geral', icon: ShieldCheck },

  { name: 'Smartphone', label: 'Celular & Tablet', category: 'Tecnologia', icon: Smartphone },
  { name: 'Laptop', label: 'Informática & Notebooks', category: 'Tecnologia', icon: Laptop },
  { name: 'Tv', label: 'TVs & Áudio', category: 'Tecnologia', icon: Tv },
  { name: 'Gamepad2', label: 'Games & Consoles', category: 'Tecnologia', icon: Gamepad2 },
  { name: 'Headphones', label: 'Fones & Som', category: 'Tecnologia', icon: Headphones },
  { name: 'Watch', label: 'Relógios & Smartwatch', category: 'Tecnologia', icon: Watch },
  { name: 'Camera', label: 'Câmeras & Fotos', category: 'Tecnologia', icon: Camera },
  { name: 'Cpu', label: 'Hardware & Peças', category: 'Tecnologia', icon: Cpu },

  { name: 'Shirt', label: 'Roupas & Moda', category: 'Moda', icon: Shirt },
  { name: 'Footprints', label: 'Calçados & Tênis', category: 'Moda', icon: Footprints },
  { name: 'Glasses', label: 'Óculos & Acessórios', category: 'Moda', icon: Glasses },
  { name: 'Briefcase', label: 'Malas & Bolsas', category: 'Moda', icon: Briefcase },

  { name: 'Home', label: 'Casa & Decoração', category: 'Casa & Cozinha', icon: Home },
  { name: 'Utensils', label: 'Cozinha & Utensílios', category: 'Casa & Cozinha', icon: Utensils },
  { name: 'Coffee', label: 'Eletroportáteis & Café', category: 'Casa & Cozinha', icon: Coffee },
  { name: 'Lightbulb', label: 'Iluminação & Smart Home', category: 'Casa & Cozinha', icon: Lightbulb },
  { name: 'Box', label: 'Organização', category: 'Casa & Cozinha', icon: Box },

  { name: 'Dumbbell', label: 'Esporte & Fitness', category: 'Saúde & Estilo', icon: Dumbbell },
  { name: 'Heart', label: 'Saúde & Beleza', category: 'Saúde & Estilo', icon: Heart },
  { name: 'Scissors', label: 'Cuidados Pessoais', category: 'Saúde & Estilo', icon: Scissors },

  { name: 'Smile', label: 'Infantil & Bebês', category: 'Outros', icon: Smile },
  { name: 'BookOpen', label: 'Livros & Leitura', category: 'Outros', icon: BookOpen },
  { name: 'Palette', label: 'Papelaria & Arte', category: 'Outros', icon: Palette },
  { name: 'Car', label: 'Automotivo', category: 'Outros', icon: Car },
  { name: 'Plane', label: 'Viagem & Acessórios', category: 'Outros', icon: Plane },
  { name: 'Music', label: 'Música & Instrumentos', category: 'Outros', icon: Music },
  { name: 'Wrench', label: 'Ferramentas & Reformas', category: 'Outros', icon: Wrench },
  { name: 'Video', label: 'Vídeos & TikTok', category: 'Outros', icon: Video },
];

export const renderCategoryIcon = (iconName?: string, className: string = 'w-4 h-4') => {
  if (!iconName) return React.createElement(Tag, { className });
  const found = AVAILABLE_CATEGORY_ICONS.find(
    (item) => item.name.toLowerCase() === iconName.toLowerCase()
  );
  if (found) {
    return React.createElement(found.icon, { className });
  }
  return React.createElement(Sparkles, { className });
};
