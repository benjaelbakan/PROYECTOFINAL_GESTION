// generarHash.js
import bcrypt from "bcryptjs";

async function main() {
  const password = "1234";
  const hash = await bcrypt.hash(password, 10);
  console.log("Hash generado:", hash);
}

main();
