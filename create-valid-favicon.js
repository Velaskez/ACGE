const fs = require('fs');

// Créer un favicon ICO valide simple
const createValidFavicon = () => {
  // Header ICO (6 bytes)
  const header = Buffer.from([
    0x00, 0x00, // Reserved
    0x01, 0x00, // Type (1 = ICO)
    0x01, 0x00  // Number of images
  ]);

  // Directory entry (16 bytes)
  const directory = Buffer.from([
    0x20,       // Width (32)
    0x20,       // Height (32)
    0x00,       // Color palette
    0x00,       // Reserved
    0x01, 0x00, // Color planes
    0x20, 0x00, // Bits per pixel (32)
    0x00, 0x04, 0x00, 0x00, // Size of image data (1024 bytes)
    0x16, 0x00, 0x00, 0x00  // Offset to image data (22 bytes)
  ]);

  // Image data - créer une image 32x32 simple avec fond bleu ACGE
  const imageData = Buffer.alloc(32 * 32 * 4); // 32x32 RGBA
  
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const offset = (y * 32 + x) * 4;
      
      // Fond bleu ACGE (#1e40af) en format BGRA
      imageData[offset] = 0xaf;     // B
      imageData[offset + 1] = 0x40; // G
      imageData[offset + 2] = 0x1e; // R
      imageData[offset + 3] = 0xff; // A
    }
  }

  // Ajouter un carré blanc au centre pour simuler le logo
  for (let y = 8; y < 24; y++) {
    for (let x = 8; x < 24; x++) {
      const offset = (y * 32 + x) * 4;
      imageData[offset] = 0xff;     // B
      imageData[offset + 1] = 0xff; // G
      imageData[offset + 2] = 0xff; // R
      imageData[offset + 3] = 0xff; // A
    }
  }

  return Buffer.concat([header, directory, imageData]);
};

// Créer le favicon
const favicon = createValidFavicon();
fs.writeFileSync('src/app/icon.ico', favicon);

console.log('Favicon ICO valide créé !');
