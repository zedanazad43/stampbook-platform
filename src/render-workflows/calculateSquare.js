const { task } = require("@renderinc/sdk/workflows");

const calculateSquare = task(
  { name: "calculateSquare" },
  function calculateSquare(a) {
    return a * a;
  },
);

module.exports = { calculateSquare };
