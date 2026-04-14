const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("StampbookTokenModule", (m) => {
  const initialOwner = m.getParameter("initialOwner", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  
  const stampbookCoin = m.contract("StampbookCoin", [initialOwner]);
  
  const activateSale = m.call(stampbookCoin, "activatePublicSale", [30]);
  
  return { stampbookCoin, activateSale };
});
