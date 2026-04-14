// scripts/fetch-and-convert.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// قاعدة بيانات الطوابع من مصادر مفتوحة
const stampsCollection = {
    egypt: [
        { id: "EG-001", name: "طابع البريد المصري 1866", year: 1866, country: "مصر", city: "القاهرة", value: 5000, rarity: "نادر جداً", category: "تاريخي", history: "أول طابع بريدي مصري", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Egypt_1866_5pa_blue.jpg/500px-Egypt_1866_5pa_blue.jpg", culture: "يعكس تطور البريد في مصر" },
        { id: "EG-002", name: "طابع الملك فاروق", year: 1944, country: "مصر", city: "الإسكندرية", value: 3500, rarity: "نادر", category: "ملكي", history: "طابع بمناسبة تتويج الملك فاروق", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Farouk_Egypt_stamp.jpg/500px-Farouk_Egypt_stamp.jpg", culture: "يظهر الملك فاروق" }
    ],
    germany: [
        { id: "DE-001", name: "Gold Wheel Berlin 1936", year: 1936, country: "ألمانيا", city: "برلين", value: 12500, rarity: "نادر", category: "أولمبي", history: "طابع أولمبياد برلين 1936", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Berlin_1936_Olympic_stamp.jpg/500px-Berlin_1936_Olympic_stamp.jpg", culture: "طابع أولمبي تاريخي" }
    ],
    uk: [
        { id: "UK-001", name: "Penny Black 1840", year: 1840, country: "بريطانيا", city: "لندن", value: 25000, rarity: "فريد", category: "تاريخي", history: "أول طابع لاصق في العالم", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Penny_Black.jpg/500px-Penny_Black.jpg", culture: "أيقونة عالمية" }
    ],
    usa: [
        { id: "US-001", name: "Inverted Jenny 1918", year: 1918, country: "الولايات المتحدة", city: "واشنطن", value: 150000, rarity: "فريد", category: "خطأ طباعة", history: "أشهر خطأ طباعة", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Inverted_Jenny_24c_1918_issue.jpg/500px-Inverted_Jenny_24c_1918_issue.jpg", culture: "أغلى خطأ طباعة" }
    ]
};

// توليد NFTs من الطوابع
export function generateNFTs() {
    const allNFTs = [];
    let counter = 1;
    
    for (const stamps of Object.values(stampsCollection)) {
        for (const stamp of stamps) {
            const salePrice = stamp.value / 100;
            const nft = {
                id: `NFT_${Date.now()}_${counter++}`,
                name: stamp.name,
                description: `${stamp.history} | صدر في ${stamp.city}، ${stamp.country} عام ${stamp.year}`,
                imageUrl: stamp.image,
                price: salePrice,
                originalValue: stamp.value,
                investmentReturn: salePrice * 0.25,
                roi: "25%",
                ownerId: null,
                status: "available",
                createdAt: new Date().toISOString(),
                metadata: {
                    stampId: stamp.id,
                    year: stamp.year,
                    country: stamp.country,
                    city: stamp.city,
                    rarity: stamp.rarity,
                    category: stamp.category,
                    history: stamp.history,
                    culture: stamp.culture
                }
            };
            allNFTs.push(nft);
        }
    }
    return allNFTs;
}

// حفظ NFTs في قاعدة البيانات
export async function saveNFTsToDatabase() {
    const nfts = generateNFTs();
    const dbPath = path.join(__dirname, '../database.json');
    let db = { nfts: [], users: [], auctions: [], transactions: [] };
    
    if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, 'utf8');
        db = JSON.parse(data);
    }
    
    const existingIds = new Set(db.nfts.map(n => n.id));
    const newNFTs = nfts.filter(n => !existingIds.has(n.id));
    db.nfts.push(...newNFTs);
    
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return newNFTs;
}

export { stampsCollection };
