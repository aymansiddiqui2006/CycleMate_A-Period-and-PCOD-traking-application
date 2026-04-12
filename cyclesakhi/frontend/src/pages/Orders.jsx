import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

const appsData = [
  // ── PADS ──────────────────────────────────────────────────────────────
  {
    id: 'zepto-pads',
    name: 'Zepto',
    color: '#3b0060',
    category: 'Pads',
    product: 'Sanitary Pads',
    link: 'https://www.zepto.com/search?query=sanitary+pads',
    image: 'https://5.imimg.com/data5/SELLER/Default/2023/9/340696951/WG/PI/YT/100035246/wings-sanitary-napkin-500x500.jpg',
  },
  {
    id: 'blinkit-pads',
    name: 'Blinkit',
    color: '#ffc200',
    category: 'Pads',
    product: 'Overnight Pads',
    link: 'https://blinkit.com/s/?q=overnight+pads',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEJk8PGM_tUqHbK2lorK6eGmyBUwkI3rMM_A&s',
  },
  {
    id: 'minutes-pads',
    name: 'Flipkart Minutes',
    color: '#ff4d4f',
    category: 'Pads',
    product: 'Ultra Thin Pads',
    link: 'https://www.flipkart.com/search?q=ultra+thin+sanitary+pads&marketplace=HYPERLOCAL',
    image: 'https://5.imimg.com/data5/OF/BN/VT/SELLER-46311541/240-mm-ultra-thin-sanitary-pad.jpg',
  },
  {
    id: 'swiggy-pads',
    name: 'Swiggy Instamart',
    color: '#fc8019',
    category: 'Pads',
    product: 'Biodegradable Pads',
    link: 'https://www.swiggy.com/instamart/search?query=biodegradable+pads',
    image: 'https://images.herzindagi.info/image/2023/Jun/biodegradable-sanitary-pads-to-replace-plastic-pads.jpg',
  },

  // ── TAMPONS ───────────────────────────────────────────────────────────
  {
    id: 'blinkit-tampons',
    name: 'Blinkit',
    color: '#ffc200',
    category: 'Tampons',
    product: 'Tampons',
    link: 'https://blinkit.com/s/?q=tampons',
    image: 'https://images.pexels.com/photos/5218033/pexels-photo-5218033.jpeg?cs=srgb&dl=pexels-shvetsa-5218033.jpg&fm=jpg',
  },
  {
    id: 'zepto-tampons',
    name: 'Zepto',
    color: '#3b0060',
    category: 'Tampons',
    product: 'Organic Tampons',
    link: 'https://www.zepto.com/search?query=organic+tampons',
    image: 'https://hips.hearstapps.com/hmg-prod/images/best-eco-friendly-tampons-2023-recyclable-biodegradable-picks-64d65db6bc291.jpg?crop=0.669xw:1.00xh;0.0586xw,0&resize=640:*',
  },
  {
    id: 'swiggy-tampons',
    name: 'Swiggy Instamart',
    color: '#fc8019',
    category: 'Tampons',
    product: 'Tampons with Applicator',
    link: 'https://www.swiggy.com/instamart/search?query=tampons',
    image: 'https://images.pexels.com/photos/3958518/pexels-photo-3958518.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },

  // ── MENSTRUAL CUPS ────────────────────────────────────────────────────
  {
    id: 'amazon-cup',
    name: 'Amazon',
    color: '#ff9900',
    category: 'Menstrual Cup',
    product: 'Menstrual Cup',
    link: 'https://www.amazon.in/s?k=menstrual+cup',
    image: 'https://c.stocksy.com/a/Y8iA00/z9/2552946.jpg?1580226051',
  },
  {
    id: 'flipkart-cup',
    name: 'Flipkart',
    color: '#2874f0',
    category: 'Menstrual Cup',
    product: 'Reusable Menstrual Cup',
    link: 'https://www.flipkart.com/search?q=menstrual+cup',
    image: 'https://cdn.shopify.com/s/files/1/0624/0655/7914/files/Menstrual_Cup_are_Eco-friendly_1024x1024.png?v=1681648310',
  },
  {
    id: 'zepto-cup',
    name: 'Zepto',
    color: '#3b0060',
    category: 'Menstrual Cup',
    product: 'Silicone Menstrual Cup',
    link: 'https://www.zepto.com/search?query=menstrual+cup',
    image: 'https://5.imimg.com/data5/ANDROID/Default/2021/9/DQ/AF/MW/89424372/product-jpeg-500x500.jpg',
  },

  // ── PERIOD PANTIES ────────────────────────────────────────────────────
  {
    id: 'flipkart-panty',
    name: 'Flipkart Minutes',
    color: '#ff4d4f',
    category: 'Period Panty',
    product: 'Period Panty',
    link: 'https://www.flipkart.com/search?q=period+panty&marketplace=HYPERLOCAL',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXBUipMyqWzQfoA7CRsBZeE3o8qTN1E7FbLw&s',
  },
  {
    id: 'amazon-panty',
    name: 'Amazon',
    color: '#ff9900',
    category: 'Period Panty',
    product: 'Leak-proof Period Underwear',
    link: 'https://www.amazon.in/s?k=period+underwear+leak+proof',
    image: 'https://fabpad.in/cdn/shop/files/High-waist_reusable_period_underwear_with_full_leak_protection.jpg?v=1755586439&width=1946',
  },

  // ── PAIN RELIEF ───────────────────────────────────────────────────────
  {
    id: 'jiomart-pain',
    name: 'JioMart',
    color: '#00529e',
    category: 'Pain Relief',
    product: 'Meftal Spas',
    link: 'https://www.jiomart.com/search?q=meftal+spas',
    image: 'https://img.pristyncare.com/static_pages/meftal-page/madison.webp',
  },
  {
    id: 'zepto-pain',
    name: 'Zepto',
    color: '#3b0060',
    category: 'Pain Relief',
    product: 'Period Pain Relief Patches',
    link: 'https://www.zepto.com/search?query=period+pain+relief',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1gM_aVIYHIioBKzvRoSgCsKuV_BiN2mmwPQ&s',
  },
  {
    id: 'blinkit-pain',
    name: 'Blinkit',
    color: '#ffc200',
    category: 'Pain Relief',
    product: 'Hot Water Bag',
    link: 'https://blinkit.com/s/?q=hot+water+bag',
    image: 'https://kangaroocareindia.com/static/media/blog-196.3b803dd730426ecd1b0d.jpg',
  },
  {
    id: 'swiggy-pain',
    name: 'Swiggy Instamart',
    color: '#fc8019',
    category: 'Pain Relief',
    product: 'Heating Pad',
    link: 'https://www.swiggy.com/instamart/search?query=heating+pad',
    image: 'https://m.media-amazon.com/images/I/71b722PZokL.jpg',
  },
  {
    id: 'pharmeasy-pain',
    name: 'PharmEasy',
    color: '#00b386',
    category: 'Pain Relief',
    product: 'Buscopan / Antispasmodic',
    link: 'https://pharmeasy.in/search/all?name=period+pain',
    image: 'https://img1.exportersindia.com/product_images/bc-small/150x150/2021/8/9139752/antispasmodic-tablets-1629866672-5956854.jpeg',
  },

  // ── INTIMATE HYGIENE ──────────────────────────────────────────────────
  {
    id: 'zepto-hygiene',
    name: 'Zepto',
    color: '#3b0060',
    category: 'Intimate Hygiene',
    product: 'Intimate Wash',
    link: 'https://www.zepto.com/search?query=intimate+wash',
    image: 'https://distrapi.blob.core.windows.net/strapi-uploads/assets/Best_Intimate_Hygiene_Wash_Brands_in_India_ed3dd472d0.jpg',
  },
  {
    id: 'blinkit-hygiene',
    name: 'Blinkit',
    color: '#ffc200',
    category: 'Intimate Hygiene',
    product: 'Feminine Hygiene Wipes',
    link: 'https://blinkit.com/s/?q=feminine+wipes',
    image: 'https://i.pinimg.com/236x/49/12/66/49126686f83f6cacb3f07a0e68ba659e.jpg',
  },
  {
    id: 'jiomart-hygiene',
    name: 'JioMart',
    color: '#00529e',
    category: 'Intimate Hygiene',
    product: 'Panty Liners',
    link: 'https://www.jiomart.com/search?q=panty+liners',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgKDYLlVFq8iGjubEFmUYVKjWkdYR8bSBEAQ&s',
  },

  // ── SUPPLEMENTS ───────────────────────────────────────────────────────
  {
    id: 'amazon-iron',
    name: 'Amazon',
    color: '#ff9900',
    category: 'Supplements',
    product: 'Iron + Folic Acid Tablets',
    link: 'https://www.amazon.in/s?k=iron+folic+acid+tablets+women',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8WHA6jujLULGmc02z0O8gSM7Hk5acy_RCXw&s',
  },
  {
    id: 'pharmeasy-mag',
    name: 'PharmEasy',
    color: '#00b386',
    category: 'Supplements',
    product: 'Magnesium for Cramps',
    link: 'https://pharmeasy.in/search/all?name=magnesium+supplement',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-6oGGQuQu-aARrJV8p4U9W2adJb7B021cVg&s',
  },
  {
    id: 'zepto-supplements',
    name: 'Zepto',
    color: '#3b0060',
    category: 'Supplements',
    product: 'Women\'s Multivitamin',
    link: 'https://www.zepto.com/search?query=womens+multivitamin',
    image: 'https://img.freepik.com/premium-photo/pink-vitamin-pills-women-white-background-multivitamins-women-s-health-isolate-free-space_94046-8425.jpg',
  },

  // ── COMFORT & WELLNESS ────────────────────────────────────────────────
  {
    id: 'blinkit-comfort',
    name: 'Blinkit',
    color: '#ffc200',
    category: 'Comfort',
    product: 'Dark Chocolate (mood boost)',
    link: 'https://blinkit.com/s/?q=dark+chocolate',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=400&h=220',
  },
  {
    id: 'swiggy-tea',
    name: 'Swiggy Instamart',
    color: '#fc8019',
    category: 'Comfort',
    product: 'Chamomile / Ginger Tea',
    link: 'https://www.swiggy.com/instamart/search?query=chamomile+tea',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=400&h=220',
  },
  {
    id: 'amazon-pad-disposal',
    name: 'Amazon',
    color: '#ff9900',
    category: 'Comfort',
    product: 'Pad Disposal Bags',
    link: 'https://www.amazon.in/s?k=sanitary+pad+disposal+bags',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsWbeqjlGVNgeiGF23nNOm6FbrFvV1jkGqFQ&s',
  },
];

const CATEGORIES = [
  'All',
  'Pads',
  'Tampons',
  'Menstrual Cup',
  'Period Panty',
  'Pain Relief',
  'Intimate Hygiene',
  'Supplements',
  'Comfort',
];

const Orders = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('All');
  const [periodSoon, setPeriodSoon] = useState(false);

  useEffect(() => {
    const checkPrediction = async () => {
      try {
        const res = await api.get('/cycle/predict');
        if (res.data?.predictedDate) {
          const days = Math.ceil((new Date(res.data.predictedDate) - new Date()) / (1000 * 60 * 60 * 24));
          if (days >= 0 && days <= 3) setPeriodSoon(true);
        }
      } catch { }
    };
    checkPrediction();
  }, []);

  const filtered = filter === 'All' ? appsData : appsData.filter(a => a.category === filter);

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-full relative">
      <div className="fixed bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-purple-300/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-gray-800 mb-1">{t('orders_title')}</h1>
            <p className="text-gray-500 text-sm">Get your hygiene essentials delivered within minutes.</p>
          </div>
          {periodSoon && (
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2 bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-full text-sm font-semibold self-start"
            >
              <Zap size={16} fill="currentColor" />
              URGENT — Period in 3 days!
            </motion.div>
          )}
        </div>

        {/* Category Filter — horizontally scrollable on mobile */}
        <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map(f => (
            <button
              key={f}
              id={`cat-${f.toLowerCase().replace(' ', '-')}`}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-5 py-2.5 min-h-[44px] rounded-xl font-semibold text-sm transition-all ${filter === f
                ? 'bg-[#FF6B8A] text-white shadow-md'
                : 'bg-white/70 backdrop-blur-xl border border-gray-100 text-gray-500 hover:text-gray-800'
                }`}
            >
              {f === 'All' ? t('all') : f}
            </button>
          ))}
        </div>

        {/* Cards — 1 col mobile, 2 col md+ */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filtered.map(app => (
            <motion.div
              key={app.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden group"
            >
              <div className="relative h-36 sm:h-44 overflow-hidden">
                <img
                  src={app.image}
                  alt={app.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <h3 className="text-white font-black text-xl sm:text-2xl tracking-wide drop-shadow">{app.name}</h3>
                </div>
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/30">
                  {app.category}
                </div>
              </div>
              <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{app.product}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold w-fit">
                    <Clock size={12} />
                    {t('order_badge')}
                  </div>
                </div>
                <a
                  href={app.link}
                  target="_blank"
                  rel="noreferrer"
                  id={`order-${app.id}`}
                  className="w-11 h-11 min-h-[44px] rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FF6B8A] group-hover:text-white transition-all shadow-sm flex-shrink-0"
                >
                  <ArrowRight size={20} />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Orders;
