const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

async function getKey(): Promise<CryptoKey> {
  let key: CryptoKey;
  const storedKey = localStorage.getItem("encryptionKey");

  if (storedKey) {
    key = await crypto.subtle.importKey(
      "jwk",
      JSON.parse(storedKey),
      { name: ALGORITHM, length: KEY_LENGTH },
      true,
      ["encrypt", "decrypt"]
    );
  } else {
    key = await crypto.subtle.generateKey(
      { name: ALGORITHM, length: KEY_LENGTH },
      true,
      ["encrypt", "decrypt"]
    );
    localStorage.setItem(
      "encryptionKey",
      JSON.stringify(await crypto.subtle.exportKey("jwk", key))
    );
  }
  return key;
}

export async function encrypt(text: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(text);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    key,
    encoded
  );

  const ivHex = Array.from(iv)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const ciphertextHex = Array.from(new Uint8Array(ciphertext))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return ivHex + ciphertextHex;
}

export async function decrypt(encryptedText: string): Promise<string> {
  const key = await getKey();
  const ivHex = encryptedText.slice(0, IV_LENGTH * 2);
  const ciphertextHex = encryptedText.slice(IV_LENGTH * 2);

  const iv = new Uint8Array(
    ivHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
  const ciphertext = new Uint8Array(
    ciphertextHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}
