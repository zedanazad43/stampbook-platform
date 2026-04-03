// عرض معلومات العقد
await stampbookCoin.getCurrentPrice()
await stampbookCoin.isSaleActive()
await stampbookCoin.totalSupply()
await stampbookCoin.balanceOf(await ethers.getSigners().then(s => s[0].address))