import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MealType, getMealLabel } from '../core/mealConfig';
import { X, Image as ImageIcon, Plus } from 'lucide-react';

const PRESET_PHOTOS: Record<MealType, { url: string; dish: string }[]> = {
  breakfast: [
    { url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=700&auto=format&fit=crop&q=80', dish: 'Crispy Masala Dosa & Sambar' },
    { url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=700&auto=format&fit=crop&q=80', dish: 'Poha & Sev' },
    { url: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=700&auto=format&fit=crop&q=80', dish: 'Idli & Medu Vada' },
  ],
  lunch: [
    { url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&auto=format&fit=crop&q=80', dish: 'Rajma Chawal & Paneer' },
    { url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=700&auto=format&fit=crop&q=80', dish: 'Chole Bhature' },
    { url: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?w=700&auto=format&fit=crop&q=80', dish: 'Veg Biryani' },
  ],
  snacks: [
    { url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&auto=format&fit=crop&q=80', dish: 'Samosas & Masala Chai' },
    { url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=700&auto=format&fit=crop&q=80', dish: 'Vada Pav' },
  ],
  dinner: [
    { url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=700&auto=format&fit=crop&q=80', dish: 'Dal Makhani & Gulab Jamun' },
    { url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=700&auto=format&fit=crop&q=80', dish: 'Paneer Butter Masala & Naan' },
  ],
};

export const AddPhotoModal: React.FC<{ isOpen: boolean; onClose: () => void; defaultMeal?: MealType }> = ({
  isOpen,
  onClose,
  defaultMeal = 'lunch',
}) => {
  const { addFoodPhoto } = useApp();
  const [meal, setMeal] = useState<MealType>(defaultMeal);
  const [dishName, setDishName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [caption, setCaption] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = photoUrl.trim() || PRESET_PHOTOS[meal][0].url;
    const finalDish = dishName.trim() || PRESET_PHOTOS[meal][0].dish;
    addFoodPhoto(meal, finalUrl, finalDish, caption);
    onClose();
  };

  const meals: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Add Meal Food Photo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Meal Category *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {meals.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMeal(m)}
                  className={`py-2 px-1 text-center font-bold rounded-xl transition-all cursor-pointer ${
                    meal === m
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {getMealLabel(m)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Dish Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Masala Dosa, Paneer Bhurji..."
              value={dishName}
              onChange={e => setDishName(e.target.value)}
              className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Photo URL (or choose preset below)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Presets */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Or pick sample food image:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_PHOTOS[meal].map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setPhotoUrl(p.url);
                    if (!dishName) setDishName(p.dish);
                  }}
                  className="rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-500 cursor-pointer p-1 bg-slate-50 space-y-1"
                >
                  <img src={p.url} alt={p.dish} className="w-full h-14 object-cover rounded" />
                  <div className="text-[10px] text-slate-700 truncate text-center font-medium">{p.dish}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Review / Note
            </label>
            <input
              type="text"
              placeholder="e.g. Very fresh today, sambar was hot..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold cursor-pointer hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Meal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
