const fs = require('fs');
const path = require('path');

const root = __dirname;
const source = 'D:/NEWW  G';
const batch = 'Batch 14';
const batchDir = path.join(root, 'assets/batches/batch-14');
fs.mkdirSync(batchDir, { recursive: true });

const newProducts = [
  ['Sufuria 150 Litres', 24500, 'Kitchenware', ['Sufuria 150Ltrs@ 24500.jpeg']],
  ['Sufuria 160 Litres', 22000, 'Kitchenware', ['Sufuria 160Ltrs @22000.jpeg']],
  ['Sufuria 180 Litres', 24000, 'Kitchenware', ['Sufuria 180Ltrs @24000.jpeg']],
  ['Sufuria 230 Litres', 33000, 'Kitchenware', ['sufuria 230ltrs@33000.jpeg']],
  ['Sufuria 250 Litres', 35000, 'Kitchenware', ['Sufuria 250ltrs @35000.jpeg']],
  ['Round Display Table', 6000, 'Furniture & chairs', ['Table 6,000.jpeg']],
  ['Toy Car PM 7 Red', 2500, 'Baby & kids', ['Toy Car PM 7RED @2500.jpeg', 'Toy car PM 7 RED @2500..jpeg']],
  ['Blue and White TV Stand', 12000, 'Furniture & chairs', ['TV stand  @12,000..jpeg', 'TV stand  @12,000.jpeg']],
  ['TV Stand with Wall Mount', 6250, 'Furniture & chairs', ['TV stand with a wall mount @6,250.jpeg']],
  ['TV Stand with Light', 10000, 'Furniture & chairs', ['TV stand with light @ 10,000.jpeg', 'TV stand with light @ 10,000..jpeg']],
  ['Black and White TV Stand', 12000, 'Furniture & chairs', ['Tv stands @12,000.jpeg']],
  ['Black and Gold TV Stand', 15650, 'Furniture & chairs', ['Tv stands @15,650.jpeg']],
  ['Two-Piece TV Stand Set', 50000, 'Furniture & chairs', ['Tv stands 2 set @50,000.jpeg', 'Tv stands 2 set @50,000..jpeg']],
  ['Glass-Top TV Stand', 8300, 'Furniture & chairs', ['Tv stands@8,300.jpeg']],
  ['White Dressing Table', 9500, 'Furniture & chairs', ['white Dressing table @9500.jpeg', 'white Dressing table @9500..jpeg']],
  ['Wooden Coffee Table', 3000, 'Furniture & chairs', ['Wooden coffee table@ 3000.jpeg', 'Wooden coffee table@ 3000..jpeg']],
  ['Wooden Dining Table with 4 Chairs', 16600, 'Furniture & chairs', ['Wooden dining table with 4 chairs @16,600.jpeg', 'Wooden dining table with 4 chairs @16,600..jpeg']],
  ['Wooden Wardrobe 3 Column', 4250, 'Furniture & chairs', ['woodenwardrobe 3 column @4250.jpeg']],
];

const galleryUpdates = [
  [977, ['Wooden dining table with 6 chairs @18,800.jpeg']],
  [683, ['vitron speaker v_510 @5500.jpeg', 'vitron speaker v_510 @5500..jpeg']],
  [685, ['Vitron speaker V_646 @6000.jpeg', 'Vitron speaker V_646 @6000..jpeg', 'Vitron speaker V_646 @6000...jpeg']],
  [655, ['Yason woofer LM_1109 @4500.jpeg', 'Yason woofer LM_1109 @4500..jpeg']],
];

let photoNo = 1;
function importPhoto(file) {
  const src = path.join(source, file);
  if (!fs.existsSync(src)) throw new Error(`Missing source photo: ${src}`);
  const rel = `assets/batches/batch-14/batch14_${String(photoNo++).padStart(3, '0')}.jpg`;
  fs.copyFileSync(src, path.join(root, rel));
  return rel;
}

function thumbnailFor(image) {
  return image.replace('assets/batches/batch-14/', 'assets/thumbs/batches/batch-14/').replace(/\.jpg$/i, '.webp');
}

const prepared = newProducts.map(([name, price, category, files]) => {
  const images = files.map(importPhoto);
  return { batch, name, price, category, image: images[0], images, thumb: thumbnailFor(images[0]), caption: `${name} @${price}/=`, stockStatus: 'in' };
});

const importedUpdates = galleryUpdates.map(([id, files]) => [id, files.map(importPhoto)]);

for (const file of ['all-photos-data.json', 'products.json']) {
  const filePath = path.join(root, file);
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data = data.filter(product => product.batch !== batch);
  for (const [id, images] of importedUpdates) {
    const product = data.find(item => Number(item.id) === id);
    if (!product) continue;
    const gallery = Array.isArray(product.images) && product.images.length ? product.images : [product.image];
    product.images = [...new Set([...gallery, ...images])];
  }
  let nextId = Math.max(...data.map(item => Number(item.id) || 0)) + 1;
  data.push(...prepared.map(product => ({ id: nextId++, ...product })));
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

for (const file of ['index.html', 'admin.html', 'app.js']) {
  const filePath = path.join(root, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content
    .replaceAll('batch-13-d-drive-products-01', 'batch-14-d-drive-products-01')
    .replaceAll('batch-12-furniture-chairs-01', 'batch-14-d-drive-products-01')
    .replaceAll('stable-lite-04', 'batch-14-d-drive-products-01');
  fs.writeFileSync(filePath, content);
}

console.log(`Added ${prepared.length} products, updated ${galleryUpdates.length} galleries, and imported ${photoNo - 1} photos.`);
