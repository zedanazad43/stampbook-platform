const { calculateSquare } = require("./calculateSquare");

async function main() {
  const arg = process.argv[2];
  const input = Number.isFinite(Number(arg)) ? Number(arg) : 5;
  const result = await Promise.resolve(calculateSquare(input));

  console.log(JSON.stringify({ task: "calculateSquare", input, result }));
}

main().catch((error) => {
  console.error("workflow run failed:", error);
  process.exit(1);
});
