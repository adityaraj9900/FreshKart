import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding FreshKart database...')

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'vegetables' }, update: {}, create: { name: 'Vegetables', slug: 'vegetables', emoji: '🥦', color: '#27AE60' } }),
    prisma.category.upsert({ where: { slug: 'fruits' }, update: {}, create: { name: 'Fruits', slug: 'fruits', emoji: '🍎', color: '#E74C3C' } }),
    prisma.category.upsert({ where: { slug: 'dairy' }, update: {}, create: { name: 'Dairy & Eggs', slug: 'dairy', emoji: '🥛', color: '#3498DB' } }),
    prisma.category.upsert({ where: { slug: 'staples' }, update: {}, create: { name: 'Staples', slug: 'staples', emoji: '🌾', color: '#E67E22' } }),
    prisma.category.upsert({ where: { slug: 'snacks' }, update: {}, create: { name: 'Snacks', slug: 'snacks', emoji: '🍿', color: '#9B59B6' } }),
    prisma.category.upsert({ where: { slug: 'beverages' }, update: {}, create: { name: 'Beverages', slug: 'beverages', emoji: '☕', color: '#1ABC9C' } }),
    prisma.category.upsert({ where: { slug: 'masalas' }, update: {}, create: { name: 'Masalas', slug: 'masalas', emoji: '🌶️', color: '#E74C3C' } }),
    prisma.category.upsert({ where: { slug: 'personal' }, update: {}, create: { name: 'Personal Care', slug: 'personal', emoji: '🧴', color: '#3498DB' } }),
    prisma.category.upsert({ where: { slug: 'household' }, update: {}, create: { name: 'Household', slug: 'household', emoji: '🧹', color: '#7F8C8D' } }),
    prisma.category.upsert({ where: { slug: 'organic' }, update: {}, create: { name: 'Organic', slug: 'organic', emoji: '🌱', color: '#2ECC71' } }),
  ])

  const [veg, fruit, dairy, staples, snacks, bev, masala, personal, household, organic] = categories
  console.log('✅ Categories seeded')

  // Products
  const products = [
    // VEGETABLES
    { name: 'Fresh Tomato', slug: 'fresh-tomato', description: 'Juicy red tomatoes from Nashik farms. Rich in Vitamin C and lycopene.', price: 35, mrp: 50, unit: '1 kg', emoji: '🍅', badge: 'Fresh', brand: 'Farm Fresh', rating: 4.5, reviews: 2341, stock: 100, tags: JSON.stringify(['fresh', 'daily essential', 'vitamin c']), categoryId: veg.id },
    { name: 'Fresh Onion', slug: 'fresh-onion', description: 'Premium quality onions from Lasalgaon market. Essential for Indian cooking.', price: 45, mrp: 60, unit: '1 kg', emoji: '🧅', badge: 'Daily Essential', brand: 'Farm Fresh', rating: 4.3, reviews: 3421, stock: 150, tags: JSON.stringify(['fresh', 'daily essential', 'kitchen staple']), categoryId: veg.id },
    { name: 'Fresh Potato', slug: 'fresh-potato', description: 'Quality potatoes from Agra farms. Rich in potassium and Vitamin B6.', price: 30, mrp: 40, unit: '1 kg', emoji: '🥔', badge: 'Best Value', brand: 'Farm Fresh', rating: 4.4, reviews: 4521, stock: 200, tags: JSON.stringify(['fresh', 'daily essential', 'budget friendly']), categoryId: veg.id },
    { name: 'Fresh Carrot', slug: 'fresh-carrot', description: 'Crunchy carrots from Punjab farms. Excellent source of beta-carotene.', price: 55, mrp: 70, unit: '1 kg', emoji: '🥕', badge: 'Vitamin A Rich', brand: 'Organic Valley', rating: 4.6, reviews: 1823, stock: 80, tags: JSON.stringify(['fresh', 'vitamin a', 'healthy']), categoryId: veg.id },
    { name: 'Green Capsicum', slug: 'green-capsicum', description: 'Fresh green capsicums. Rich in Vitamin C and B6. Perfect for stir fries.', price: 80, mrp: 100, unit: '500 g', emoji: '🫑', badge: 'Vit C Rich', brand: 'Farm Fresh', rating: 4.2, reviews: 987, stock: 60, tags: JSON.stringify(['fresh', 'vitamin c']), categoryId: veg.id },
    { name: 'Palak (Spinach)', slug: 'palak-spinach', description: 'Fresh tender spinach leaves. Excellent source of iron, folate, and Vitamin K.', price: 25, mrp: 35, unit: '250 g', emoji: '🌿', badge: 'Iron Rich', brand: 'Farm Fresh', rating: 4.4, reviews: 1456, stock: 50, tags: JSON.stringify(['fresh', 'iron rich', 'greens']), categoryId: veg.id },
    { name: 'Cauliflower', slug: 'cauliflower', description: 'Fresh white cauliflower from Varanasi. Great for gobi matar and aloo gobi.', price: 40, mrp: 55, unit: '1 piece', emoji: '🥦', badge: 'Fresh', brand: 'Farm Fresh', rating: 4.3, reviews: 876, stock: 70, tags: JSON.stringify(['fresh', 'seasonal']), categoryId: veg.id },
    { name: 'Lady Finger (Bhindi)', slug: 'lady-finger-bhindi', description: 'Tender bhindi from Maharashtra. Rich in fiber and folate.', price: 50, mrp: 65, unit: '500 g', emoji: '🥒', badge: 'Fresh', brand: 'Farm Fresh', rating: 4.1, reviews: 654, stock: 60, tags: JSON.stringify(['fresh', 'fiber rich']), categoryId: veg.id },
    { name: 'Green Peas (Matar)', slug: 'green-peas-matar', description: 'Sweet fresh green peas from Punjab. Good source of protein and fiber.', price: 80, mrp: 100, unit: '500 g', emoji: '🫛', badge: 'Protein Rich', brand: 'Farm Fresh', rating: 4.5, reviews: 1234, stock: 45, tags: JSON.stringify(['fresh', 'protein', 'seasonal']), categoryId: veg.id },
    { name: 'Garlic (Lehsun)', slug: 'garlic-lehsun', description: 'Fresh garlic bulbs. Rich in allicin with antibacterial properties.', price: 120, mrp: 150, unit: '250 g', emoji: '🧄', badge: 'Immunity Booster', brand: 'Farm Fresh', rating: 4.7, reviews: 2345, stock: 100, tags: JSON.stringify(['fresh', 'immunity', 'essential']), categoryId: veg.id },
    { name: 'Ginger (Adrak)', slug: 'ginger-adrak', description: 'Fresh ginger root. Powerful anti-inflammatory and digestive properties.', price: 100, mrp: 130, unit: '250 g', emoji: '🫚', badge: 'Anti-Inflammatory', brand: 'Farm Fresh', rating: 4.6, reviews: 1987, stock: 80, tags: JSON.stringify(['fresh', 'anti-inflammatory', 'medicinal']), categoryId: veg.id },
    { name: 'Brinjal (Baingan)', slug: 'brinjal-baingan', description: 'Fresh purple brinjal. Perfect for baingan bharta and curries.', price: 35, mrp: 50, unit: '500 g', emoji: '🍆', badge: 'Fresh', brand: 'Farm Fresh', rating: 4.0, reviews: 432, stock: 55, tags: JSON.stringify(['fresh', 'versatile']), categoryId: veg.id },
    // FRUITS
    { name: 'Banana (Elaichi)', slug: 'banana-elaichi', description: 'Sweet elaichi bananas from Kerala. Rich in potassium and natural energy.', price: 55, mrp: 70, unit: '12 pieces', emoji: '🍌', badge: 'Energy Booster', brand: 'Farm Fresh', rating: 4.6, reviews: 4532, stock: 120, tags: JSON.stringify(['fresh', 'energy', 'kids favorite']), categoryId: fruit.id },
    { name: 'Apple (Kashmiri)', slug: 'apple-kashmiri', description: 'Premium Kashmiri Royal Delicious apples. Rich in fiber and antioxidants.', price: 180, mrp: 240, unit: '1 kg (~5 pcs)', emoji: '🍎', badge: 'Premium', brand: 'Kashmir Farms', rating: 4.7, reviews: 3421, stock: 80, tags: JSON.stringify(['fresh', 'premium', 'fiber']), categoryId: fruit.id },
    { name: 'Alphonso Mango', slug: 'alphonso-mango', description: 'The legendary Ratnagiri Alphonso mango - King of fruits! Aromatic and buttery.', price: 380, mrp: 500, unit: '1 kg (~4 pcs)', emoji: '🥭', badge: 'King of Fruits', brand: 'Ratnagiri Farms', rating: 4.9, reviews: 5678, stock: 30, tags: JSON.stringify(['seasonal', 'premium', 'summer']), categoryId: fruit.id },
    { name: 'Green Grapes', slug: 'green-grapes', description: 'Seedless green grapes from Nashik vineyards. Sweet and crunchy.', price: 120, mrp: 160, unit: '500 g', emoji: '🍇', badge: 'Seedless', brand: 'Nashik Grapes', rating: 4.4, reviews: 2134, stock: 60, tags: JSON.stringify(['fresh', 'seedless']), categoryId: fruit.id },
    { name: 'Pomegranate (Anar)', slug: 'pomegranate-anar', description: 'Premium Solapur pomegranates. Extremely rich in antioxidants and Vitamin C.', price: 160, mrp: 200, unit: '2 pieces', emoji: '🍎', badge: 'Antioxidant Rich', brand: 'Solapur Farms', rating: 4.8, reviews: 1987, stock: 50, tags: JSON.stringify(['fresh', 'antioxidant', 'heart healthy']), categoryId: fruit.id },
    { name: 'Orange (Nagpur)', slug: 'orange-nagpur', description: 'Famous Nagpur oranges. Juicy and sweet. Excellent source of Vitamin C.', price: 90, mrp: 120, unit: '1 kg (~4 pcs)', emoji: '🍊', badge: 'Vitamin C Rich', brand: 'Nagpur Oranges', rating: 4.5, reviews: 2456, stock: 70, tags: JSON.stringify(['fresh', 'vitamin c', 'seasonal']), categoryId: fruit.id },
    { name: 'Kiwi', slug: 'kiwi', description: 'Premium imported kiwi fruits. One kiwi has more Vitamin C than an orange.', price: 180, mrp: 240, unit: '6 pieces', emoji: '🥝', badge: 'Exotic', brand: 'Imported', rating: 4.6, reviews: 1234, stock: 35, tags: JSON.stringify(['fresh', 'exotic', 'vitamin c']), categoryId: fruit.id },
    { name: 'Watermelon', slug: 'watermelon', description: 'Sweet red watermelon. 92% water content makes it perfect for summer hydration.', price: 45, mrp: 60, unit: '1 kg', emoji: '🍉', badge: 'Hydrating', brand: 'Farm Fresh', rating: 4.5, reviews: 2876, stock: 15, tags: JSON.stringify(['fresh', 'hydrating', 'summer']), categoryId: fruit.id },
    // DAIRY
    { name: 'Amul Full Cream Milk', slug: 'amul-full-cream-milk', description: "Amul Full Cream Standardized Milk. India's most trusted milk brand. 6% fat.", price: 68, mrp: 68, unit: '1 Litre', emoji: '🥛', badge: 'Amul', brand: 'Amul', rating: 4.7, reviews: 8765, stock: 200, tags: JSON.stringify(['daily essential', 'amul', 'calcium']), categoryId: dairy.id },
    { name: 'Mother Dairy Curd', slug: 'mother-dairy-curd', description: 'Fresh probiotic curd with live cultures. Great for gut health.', price: 45, mrp: 50, unit: '400 g', emoji: '🍚', badge: 'Probiotic', brand: 'Mother Dairy', rating: 4.5, reviews: 3456, stock: 150, tags: JSON.stringify(['probiotic', 'gut health', 'fresh']), categoryId: dairy.id },
    { name: 'Amul Fresh Paneer', slug: 'amul-fresh-paneer', description: "Amul Fresh Paneer made from pure cow's milk. 18g protein per 100g.", price: 105, mrp: 120, unit: '200 g', emoji: '🧀', badge: 'Protein Rich', brand: 'Amul', rating: 4.6, reviews: 4321, stock: 80, tags: JSON.stringify(['protein rich', 'amul', 'vegetarian protein']), categoryId: dairy.id },
    { name: 'Amul Butter', slug: 'amul-butter', description: "India's most loved butter. Made from fresh cream. Perfect for toast and paratha.", price: 56, mrp: 60, unit: '100 g', emoji: '🧈', badge: 'Amul', brand: 'Amul', rating: 4.8, reviews: 6543, stock: 120, tags: JSON.stringify(['amul', 'breakfast', 'daily essential']), categoryId: dairy.id },
    { name: 'Amul Ghee', slug: 'amul-ghee', description: "Amul Pure Cow Ghee. Made from fresh cream butter. Rich aroma and golden color.", price: 295, mrp: 330, unit: '500 ml', emoji: '🫙', badge: 'Pure', brand: 'Amul', rating: 4.9, reviews: 7654, stock: 100, tags: JSON.stringify(['pure', 'amul', 'traditional', 'ayurvedic']), categoryId: dairy.id },
    { name: 'Farm Fresh Eggs', slug: 'farm-fresh-eggs', description: 'Fresh free-range eggs from Nandini Farms. Rich in protein and Vitamin D.', price: 85, mrp: 95, unit: '12 pieces', emoji: '🥚', badge: 'Farm Fresh', brand: 'Nandini Farms', rating: 4.4, reviews: 5432, stock: 300, tags: JSON.stringify(['protein rich', 'fresh', 'daily']), categoryId: dairy.id },
    // STAPLES
    { name: 'India Gate Basmati Rice', slug: 'india-gate-basmati-rice', description: 'India Gate Classic Basmati Rice. Long-grain aromatic basmati from the Himalayas.', price: 420, mrp: 500, unit: '5 kg', emoji: '🍚', badge: 'Premium', brand: 'India Gate', rating: 4.8, reviews: 8765, stock: 200, tags: JSON.stringify(['biryani', 'premium', 'aromatic']), categoryId: staples.id },
    { name: 'Aashirvaad Atta', slug: 'aashirvaad-atta', description: "Aashirvaad Select Whole Wheat Atta. Made from superior MP wheat grains.", price: 260, mrp: 300, unit: '5 kg', emoji: '🌾', badge: 'Whole Wheat', brand: 'Aashirvaad', rating: 4.7, reviews: 9876, stock: 300, tags: JSON.stringify(['whole wheat', 'daily essential', 'soft roti']), categoryId: staples.id },
    { name: 'Tata Salt', slug: 'tata-salt', description: "India's most trusted salt brand. Iodized for thyroid health. 99.9% pure NaCl.", price: 22, mrp: 25, unit: '1 kg', emoji: '🧂', badge: 'Iodized', brand: 'Tata', rating: 4.9, reviews: 12345, stock: 500, tags: JSON.stringify(['daily essential', 'tata', 'iodized']), categoryId: staples.id },
    { name: 'Tata Sampann Moong Dal', slug: 'tata-sampann-moong-dal', description: 'Tata Sampann Unpolished Moong Dal. Retains natural oils and nutrients.', price: 145, mrp: 175, unit: '1 kg', emoji: '🫘', badge: 'Unpolished', brand: 'Tata Sampann', rating: 4.6, reviews: 3456, stock: 150, tags: JSON.stringify(['protein rich', 'unpolished', 'nutritious']), categoryId: staples.id },
    { name: 'Saffola Gold Oil', slug: 'saffola-gold-oil', description: 'Saffola Gold Blended Edible Oil. Blend of ricebran and corn oil. Good for heart.', price: 295, mrp: 355, unit: '2 Litre', emoji: '🫙', badge: 'Heart Health', brand: 'Saffola', rating: 4.6, reviews: 4567, stock: 180, tags: JSON.stringify(['heart healthy', 'refined oil', 'cooking']), categoryId: staples.id },
    { name: 'Maggi 2-Minute Noodles', slug: 'maggi-2-minute-noodles', description: "India's most beloved instant noodles! Masala flavor. Family pack of 12.", price: 168, mrp: 192, unit: '12 x 70g', emoji: '🍜', badge: 'Fan Favorite', brand: 'Maggi', rating: 4.8, reviews: 15678, stock: 500, tags: JSON.stringify(['instant', 'kids favorite', 'comfort food']), categoryId: staples.id },
    // SNACKS
    { name: "Lay's Classic Salted", slug: 'lays-classic-salted', description: "Lay's Classic Salted potato chips. Crispy, light, and perfectly salted.", price: 20, mrp: 20, unit: '52 g', emoji: '🥔', badge: 'MRP ₹20', brand: "Lay's", rating: 4.4, reviews: 8765, stock: 500, tags: JSON.stringify(['chips', 'crispy', 'popular']), categoryId: snacks.id },
    { name: 'Kurkure Masala Munch', slug: 'kurkure-masala-munch', description: 'Kurkure Masala Munch - the original Indian snack with tangy masala flavor.', price: 30, mrp: 30, unit: '90 g', emoji: '🌽', badge: 'Spicy', brand: 'Kurkure', rating: 4.6, reviews: 9876, stock: 400, tags: JSON.stringify(['spicy', 'indian snack', 'popular']), categoryId: snacks.id },
    { name: "Haldiram's Aloo Bhujia", slug: 'haldirams-aloo-bhujia', description: "Haldiram's authentic Aloo Bhujia from Bikaner. The original recipe since 1937.", price: 85, mrp: 100, unit: '200 g', emoji: '🥨', badge: 'Authentic', brand: "Haldiram's", rating: 4.8, reviews: 7654, stock: 300, tags: JSON.stringify(['authentic', 'namkeen', 'traditional']), categoryId: snacks.id },
    { name: 'Parle-G Biscuits', slug: 'parle-g-biscuits', description: "Parle-G - India's most sold biscuit. The world's largest selling biscuit brand.", price: 55, mrp: 65, unit: '799 g', emoji: '🍪', badge: 'India #1', brand: 'Parle-G', rating: 4.9, reviews: 25678, stock: 600, tags: JSON.stringify(['india number 1', 'glucose', 'energy']), categoryId: snacks.id },
    { name: 'Britannia Good Day', slug: 'britannia-good-day', description: 'Britannia Good Day Butter Cookies. Rich buttery taste with real cashew nuts.', price: 45, mrp: 50, unit: '200 g', emoji: '🍪', badge: 'Buttery', brand: 'Britannia', rating: 4.7, reviews: 6543, stock: 400, tags: JSON.stringify(['butter', 'cookies', 'premium']), categoryId: snacks.id },
    // BEVERAGES
    { name: 'Tata Tea Premium', slug: 'tata-tea-premium', description: 'Tata Tea Premium - a blend of Assam and Darjeeling teas. Strong, aromatic cup.', price: 265, mrp: 310, unit: '500 g', emoji: '🍵', badge: 'Premium', brand: 'Tata Tea', rating: 4.7, reviews: 7654, stock: 200, tags: JSON.stringify(['morning tea', 'premium', 'assam']), categoryId: bev.id },
    { name: 'Nescafé Classic', slug: 'nescafe-classic', description: "Nescafé Classic 100% pure coffee. Rich smooth taste. No chicory added.", price: 195, mrp: 225, unit: '50 g', emoji: '☕', badge: 'Aromatic', brand: 'Nescafé', rating: 4.6, reviews: 5432, stock: 150, tags: JSON.stringify(['coffee', 'pure', 'aromatic']), categoryId: bev.id },
    { name: 'Real Juice Mango', slug: 'real-juice-mango', description: 'Real Fruit Power Mango Juice. Made from real Alphonso mango pulp.', price: 125, mrp: 150, unit: '1 Litre', emoji: '🥭', badge: 'No Added Sugar', brand: 'Real', rating: 4.4, reviews: 3456, stock: 120, tags: JSON.stringify(['juice', 'mango', 'vitamin c']), categoryId: bev.id },
    { name: 'Coca-Cola 2L', slug: 'coca-cola-2l', description: 'Coca-Cola - the iconic sparkling beverage. Crisp, refreshing taste.', price: 92, mrp: 100, unit: '2 Litre', emoji: '🥤', badge: 'Refreshing', brand: 'Coca-Cola', rating: 4.5, reviews: 8765, stock: 300, tags: JSON.stringify(['cold drink', 'refreshing', 'party']), categoryId: bev.id },
    { name: 'Horlicks Health Drink', slug: 'horlicks-health-drink', description: "Horlicks - India's leading health drink. Contains 23 vital nutrients.", price: 285, mrp: 330, unit: '500 g', emoji: '🥛', badge: 'Nutrition', brand: 'Horlicks', rating: 4.6, reviews: 5678, stock: 150, tags: JSON.stringify(['kids', 'nutrition', 'calcium']), categoryId: bev.id },
    // MASALAS
    { name: 'MDH Garam Masala', slug: 'mdh-garam-masala', description: 'MDH Garam Masala - the most authentic blend of 10 spices.', price: 50, mrp: 60, unit: '50 g', emoji: '🌶️', badge: 'Authentic', brand: 'MDH', rating: 4.8, reviews: 6543, stock: 200, tags: JSON.stringify(['authentic', 'mdh', 'essential']), categoryId: masala.id },
    { name: 'Everest Kitchen King', slug: 'everest-kitchen-king', description: "Everest Kitchen King Masala - the king of all masalas! Universal spice blend.", price: 90, mrp: 110, unit: '100 g', emoji: '👑', badge: 'King of Masalas', brand: 'Everest', rating: 4.7, reviews: 5432, stock: 180, tags: JSON.stringify(['universal', 'versatile', 'all purpose']), categoryId: masala.id },
    { name: 'Heinz Tomato Ketchup', slug: 'heinz-tomato-ketchup', description: "Heinz Tomato Ketchup - the world's most popular ketchup. No artificial colors.", price: 140, mrp: 170, unit: '450 g', emoji: '🍅', badge: 'Classic', brand: 'Heinz', rating: 4.7, reviews: 7654, stock: 200, tags: JSON.stringify(['ketchup', 'sauce', 'kids favorite']), categoryId: masala.id },
    { name: 'MDH Chaat Masala', slug: 'mdh-chaat-masala', description: 'MDH Chaat Masala. The magical tangy masala for chaat, fruits, and salads.', price: 35, mrp: 42, unit: '100 g', emoji: '🌶️', badge: 'Tangy', brand: 'MDH', rating: 4.9, reviews: 7654, stock: 250, tags: JSON.stringify(['chaat', 'tangy', 'street food']), categoryId: masala.id },
    // PERSONAL CARE
    { name: 'Dove Beauty Soap', slug: 'dove-beauty-soap', description: 'Dove Beauty Cream Bar. 1/4 moisturizing cream. Gentle for all skin types.', price: 55, mrp: 65, unit: '75 g x 3', emoji: '🧼', badge: 'Moisturizing', brand: 'Dove', rating: 4.7, reviews: 5678, stock: 200, tags: JSON.stringify(['moisturizing', 'gentle', 'all skin types']), categoryId: personal.id },
    { name: 'Clinic Plus Shampoo', slug: 'clinic-plus-shampoo', description: 'Clinic Plus Strong & Long Shampoo. With milk protein and vitamin formula.', price: 165, mrp: 190, unit: '340 ml', emoji: '🚿', badge: 'Strong Hair', brand: 'Clinic Plus', rating: 4.5, reviews: 4321, stock: 150, tags: JSON.stringify(['hair care', 'strong hair']), categoryId: personal.id },
    { name: 'Colgate MaxFresh', slug: 'colgate-maxfresh', description: 'Colgate MaxFresh Spearmint Toothpaste. 12-hour fresh breath. Fights cavities.', price: 95, mrp: 110, unit: '200 g', emoji: '🦷', badge: 'Fresh Breath', brand: 'Colgate', rating: 4.6, reviews: 6543, stock: 300, tags: JSON.stringify(['fresh breath', 'anti-cavity', 'daily']), categoryId: personal.id },
    { name: 'Dettol Hand Wash', slug: 'dettol-hand-wash', description: 'Dettol Original Liquid Hand Wash. Kills 99.9% of bacteria and viruses.', price: 99, mrp: 115, unit: '250 ml', emoji: '💧', badge: '99.9% Germ Kill', brand: 'Dettol', rating: 4.8, reviews: 8765, stock: 250, tags: JSON.stringify(['hygiene', 'germ kill', 'antibacterial']), categoryId: personal.id },
    // HOUSEHOLD
    { name: 'Vim Dishwash Gel', slug: 'vim-dishwash-gel', description: 'Vim Anti-Bacterial Dishwash Liquid. Tough on grease, gentle on hands.', price: 95, mrp: 110, unit: '500 ml', emoji: '🍽️', badge: 'Anti-Bacterial', brand: 'Vim', rating: 4.6, reviews: 4321, stock: 200, tags: JSON.stringify(['dishwash', 'anti-bacterial', 'kitchen']), categoryId: household.id },
    { name: 'Surf Excel Easy Wash', slug: 'surf-excel-easy-wash', description: 'Surf Excel Easy Wash Detergent Powder. Removes 10 tough stains in one wash.', price: 395, mrp: 450, unit: '2 kg', emoji: '👕', badge: 'Tough Stain Remove', brand: 'Surf Excel', rating: 4.7, reviews: 7654, stock: 150, tags: JSON.stringify(['laundry', 'stain removal']), categoryId: household.id },
    { name: 'Harpic Power Plus', slug: 'harpic-power-plus', description: 'Harpic Power Plus Toilet Cleaner. Kills 99.9% germs. Removes stains in 30s.', price: 99, mrp: 115, unit: '500 ml', emoji: '🚽', badge: '10x Cleaning', brand: 'Harpic', rating: 4.8, reviews: 5432, stock: 200, tags: JSON.stringify(['toilet cleaner', 'germ kill', 'bathroom']), categoryId: household.id },
    // ORGANIC
    { name: 'Organic India Tulsi Tea', slug: 'organic-india-tulsi-tea', description: "Organic India Tulsi Green Tea. USDA certified organic. Immunity booster.", price: 195, mrp: 225, unit: '25 bags', emoji: '🌿', badge: '100% Organic', brand: 'Organic India', rating: 4.8, reviews: 2345, stock: 100, tags: JSON.stringify(['organic', 'tulsi', 'immunity', 'certified organic']), categoryId: organic.id },
    { name: 'Patanjali Honey', slug: 'patanjali-honey', description: 'Patanjali Pure Natural Honey. Raw, unprocessed from Himalayan bee farms.', price: 175, mrp: 210, unit: '500 g', emoji: '🍯', badge: 'Pure & Natural', brand: 'Patanjali', rating: 4.6, reviews: 4567, stock: 80, tags: JSON.stringify(['pure', 'natural', 'ayurvedic']), categoryId: organic.id },
    { name: 'Dabur Chyawanprash', slug: 'dabur-chyawanprash', description: 'Dabur Chyawanprash. 40+ herbal ingredients. 3x immunity booster.', price: 265, mrp: 310, unit: '500 g', emoji: '🫙', badge: 'Immunity Builder', brand: 'Dabur', rating: 4.9, reviews: 9876, stock: 100, tags: JSON.stringify(['ayurvedic', 'immunity', 'traditional']), categoryId: organic.id },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
  }
  console.log(`✅ ${products.length} Products seeded`)

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@freshkart.com' },
    update: {},
    create: { name: 'Super Admin', email: 'admin@freshkart.com', phone: '9999999999', password: adminPassword, role: 'admin' },
  })

  // Demo customer
  const demoPassword = await bcrypt.hash('demo123', 10)
  await prisma.user.upsert({
    where: { email: 'demo@freshkart.com' },
    update: {},
    create: { name: 'Demo User', email: 'demo@freshkart.com', phone: '9876543210', password: demoPassword, role: 'customer', address: 'Indiranagar, Bangalore - 560038' },
  })
  console.log('✅ Users seeded')

  // Delivery boys
  const dbPass = await bcrypt.hash('delivery123', 10)
  const deliveryBoys = [
    { name: 'Ravi Kumar', email: 'ravi@freshkart.com', phone: '9876543210', area: 'Indiranagar', totalDeliveries: 456, todayDeliveries: 8, rating: 4.7, earnings: 12500 },
    { name: 'Suresh Yadav', email: 'suresh@freshkart.com', phone: '9988776655', area: 'Koramangala', totalDeliveries: 387, todayDeliveries: 5, rating: 4.5, earnings: 10800 },
    { name: 'Pradeep Singh', email: 'pradeep@freshkart.com', phone: '9012345678', area: 'HSR Layout', totalDeliveries: 512, todayDeliveries: 10, rating: 4.8, earnings: 15200 },
  ]
  for (const db of deliveryBoys) {
    await prisma.deliveryBoy.upsert({
      where: { email: db.email },
      update: {},
      create: { ...db, password: dbPass },
    })
  }
  console.log('✅ Delivery boys seeded')

  // Promo codes
  const promos = [
    { code: 'FRESH10', discount: 10, type: 'percent', minOrder: 200, maxDiscount: 100, description: '10% off on orders above ₹200' },
    { code: 'NEWUSER50', discount: 50, type: 'flat', minOrder: 150, maxDiscount: 50, description: '₹50 off on first order' },
    { code: 'SAVE100', discount: 100, type: 'flat', minOrder: 500, maxDiscount: 100, description: '₹100 off on orders above ₹500' },
    { code: 'WEEKEND15', discount: 15, type: 'percent', minOrder: 400, maxDiscount: 200, description: '15% off on weekends' },
  ]
  for (const promo of promos) {
    await prisma.promoCode.upsert({ where: { code: promo.code }, update: {}, create: promo })
  }
  console.log('✅ Promo codes seeded')

  console.log('🎉 Database seeding complete!')
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
