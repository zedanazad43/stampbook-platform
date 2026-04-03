const [_, buyer] = await ethers.getSigners();
await stampbookCoin.connect(buyer).buyTokens({ value: ethers.parseEther("0.5") });