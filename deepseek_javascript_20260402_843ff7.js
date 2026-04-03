// عرض إحصائيات فورية
setInterval(async () => {
    const price = await stampbookCoin.getCurrentPrice();
    const active = await stampbookCoin.isSaleActive();
    const supply = await stampbookCoin.totalSupply();
    console.clear();
    console.log(`
╔═══════════════════════════════════════╗
║     📮 STAMPBOOK COIN - MONITOR      ║
╠═══════════════════════════════════════╣
║ 💰 السعر: ${ethers.formatEther(price)} ETH/STP
║ 📈 المبيعات: ${active ? "🟢 نشطة" : "🔴 مغلقة"}
║ 📦 العرض: ${ethers.formatEther(supply)} STP
║ 🕐 الوقت: ${new Date().toLocaleTimeString()}
╚═══════════════════════════════════════╝
    `);
}, 3000);