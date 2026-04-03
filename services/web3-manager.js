const { WalletManager, Chain, IntegrationSource } = require('@cygnus-wealth/wallet-integration-system');

class Web3Manager {
    constructor() {
        this.walletManager = new WalletManager();
        this.supportedChains = [Chain.ETHEREUM, Chain.BSC, Chain.POLYGON, Chain.ARBITRUM, Chain.OPTIMISM, Chain.AVALANCHE, Chain.BASE];
    }
    async connectToChain(chain, walletSource = IntegrationSource.METAMASK) {
        try {
            const connection = await this.walletManager.connectWallet(chain, walletSource);
            return { success: true, chain, address: connection.address };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    async disconnect(chain) { await this.walletManager.disconnectWallet(chain); }
}
module.exports = new Web3Manager();
