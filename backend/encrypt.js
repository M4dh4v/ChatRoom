import crypto from "crypto";

const encrypt = (inputString) => {
  return crypto.createHash("sha256").update(inputString).digest("hex");
};

export default encrypt;
