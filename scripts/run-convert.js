import { saveNFTsToDatabase } from './fetch-and-convert.js';

saveNFTsToDatabase().then(nfts => {
    console.log("تم إنشاء " + nfts.length + " NFT وجاهز للبيع");
    console.log("تفاصيل NFTs:");
    nfts.forEach(nft => {
        console.log("   - " + nft.name + ": " + nft.price + " STP");
    });
}).catch(err => {
    console.log("خطأ: " + err.message);
});
