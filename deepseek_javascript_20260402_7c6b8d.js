// ============================================
// 🚀 STAMPBOOK COIN - DEPLOYMENT & MONITORING
// ============================================

(async () => {
    console.log("🚀 بدء عملية النشر المتكاملة...\n");
    
    // 1. تحديد الشبكة والحسابات
    const accounts = await ethers.getSigners();
    const owner = accounts[0];
    const buyer = accounts[1];
    
    console.log(`📡 مالك العقد: ${owner.address}`);
    console.log(`💰 رصيد المالك: ${ethers.formatEther(await owner.provider.getBalance(owner.address))} ETH`);
    console.log(`👤 مشتري تجريبي: ${buyer.address}\n`);
    
    // 2. تجميع العقد
    console.log("📦 جاري تجميع العقد...");
    const StampbookCoin = await ethers.getContractFactory("StampbookCoin");
    
    // 3. نشر العقد
    console.log("📝 جاري نشر StampbookCoin...");
    const stampbookCoin = await StampbookCoin.deploy(owner.address);
    await stampbookCoin.waitForDeployment();
    const contractAddress = await stampbookCoin.getAddress();
    
    console.log(`\n✅ تم نشر العقد بنجاح!`);
    console.log(`📜 عنوان العقد: ${contractAddress}`);
    
    // 4. تفعيل المبيعات العامة
    console.log("\n🔄 جاري تفعيل المبيعات العامة...");
    const tx = await stampbookCoin.activatePublicSale(30);
    await tx.wait();
    console.log(`✅ تم تفعيل المبيعات لمدة 30 يوماً`);
    
    // 5. عرض معلومات العقد
    const price = await stampbookCoin.getCurrentPrice();
    const isActive = await stampbookCoin.isSaleActive();
    const totalSupply = await stampbookCoin.totalSupply();
    const ownerBalance = await stampbookCoin.balanceOf(owner.address);
    
    console.log(`\n📊 معلومات العقد:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`💰 سعر العملة: ${ethers.formatEther(price)} ETH لكل STP`);
    console.log(`📈 المبيعات نشطة: ${isActive ? "✅ نعم" : "❌ لا"}`);
    console.log(`📦 إجمالي العرض: ${ethers.formatEther(totalSupply)} STP`);
    console.log(`👑 رصيد المالك: ${ethers.formatEther(ownerBalance)} STP`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    // 6. اختبار شراء العملات
    console.log("🧪 جاري اختبار شراء العملات...");
    const buyAmount = ethers.parseEther("0.1");
    const expectedTokens = (0.1 / 0.4).toFixed(4);
    
    const buyTx = await stampbookCoin.connect(buyer).buyTokens({ value: buyAmount });
    await buyTx.wait();
    
    const buyerBalance = await stampbookCoin.balanceOf(buyer.address);
    console.log(`✅ تم شراء ${ethers.formatEther(buyerBalance)} STP مقابل 0.1 ETH`);
    
    // 7. حفظ معلومات النشر
    const deployInfo = {
        contractAddress: contractAddress,
        network: (await ethers.provider.getNetwork()).name,
        owner: owner.address,
        deployTime: new Date().toISOString(),
        price: ethers.formatEther(price),
        totalSupply: ethers.formatEther(totalSupply),
        saleActive: isActive,
        testBuy: {
            buyer: buyer.address,
            amountETH: "0.1",
            receivedSTP: ethers.formatEther(buyerBalance)
        }
    };
    
    console.log("\n💾 معلومات النشر:");
    console.log(JSON.stringify(deployInfo, null, 2));
    
    // 8. إنشاء رابط لمشاهدة العقد
    console.log(`\n🔗 رابط العقد المحلي: http://localhost:8545/contract/${contractAddress}`);
    console.log(`\n🎉 اكتمل! العقد جاهز للاستخدام.`);
    
    // 9. إرجاع العقد للاستخدام لاحقاً
    window.stampbookCoin = stampbookCoin;
    console.log("\n💡 يمكنك الآن استخدام stampbookCoin في console للتفاعل مع العقد");
    
    return deployInfo;
})();