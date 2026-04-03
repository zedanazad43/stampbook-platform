// الاستماع لأحداث الشراء
stampbookCoin.on("Transfer", (from, to, amount) => {
    console.log(`💰 تحويل: ${ethers.formatEther(amount)} STP من ${from} إلى ${to}`);
});