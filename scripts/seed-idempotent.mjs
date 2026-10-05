/**
 * Seed IDEMPOTENTE de producción.
 *
 * Se ejecuta dentro del contenedor de la app:
 *   docker compose -f compose.prod.yaml exec -T app node scripts/seed-idempotent.mjs
 *
 * Contraste con `npm run seed` (scripts/seed.ts), que es DESTRUCTIVO:
 * ese script hace deleteMany({}) sobre products/categories/media y está
 * pensado sólo para desarrollo. Este NO borra nada.
 *
 * Estrategia: UPSERT por `slug`.
 *   - documento ausente  -> se crea
 *   - documento presente -> se actualiza su contenido conservando su _id
 *   - documento de más    -> se deja intacto (nunca se borra)
 * Por eso es seguro reejecutarlo tantas veces como haga falta.
 *
 * Plain .mjs a propósito: el runtime de producción no instala TypeScript ni
 * el devDependency `tsx`, así que sólo un .mjs corre con `node` pelado.
 */

import { MongoClient } from 'mongodb';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(readFileSync(join(here, 'fixtures', 'catalog.json'), 'utf8'));

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/naturalvers';

/** Saca el nombre de la BD de la URI; permite override con MONGO_DB_NAME. */
function resolveDbName(uri) {
  const explicit = process.env.MONGO_DB_NAME;
  if (explicit) return explicit;
  const match = /mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/.exec(uri);
  return match ? decodeURIComponent(match[1]) : 'naturalvers';
}

const DB_NAME = resolveDbName(URI);
const now = new Date().toISOString();

/**
 * Inserta o actualiza por una clave natural y nunca borra.
 *
 * El campo clave NO es el mismo en todas las colecciones: categories y
 * products se identifican por `slug`, pero `media` es una colección `upload`
 * de Payload y NO tiene campo `slug`; su clave es `filename`, sobre la que
 * Payload crea un índice ÚNICO. Usar `slug` ahí hacía que la segunda
 * ejecución no encontrara el documento e intentara insertarlo, provocando
 * E11000 duplicate key error sobre filename_1.
 *
 * Devuelve el _id resultante y si la fila se creó o se actualizó.
 */
async function upsertBy(collection, keyField, keyValue, fields) {
  const existing = await collection.findOne(
    { [keyField]: keyValue },
    { projection: { _id: 1 } },
  );

  if (existing) {
    await collection.updateOne(
      { [keyField]: keyValue },
      { $set: { ...fields, updatedAt: now } },
    );
    return { _id: existing._id, action: 'updated' };
  }

  const doc = { [keyField]: keyValue, ...fields, createdAt: now, updatedAt: now };
  await collection.insertOne(doc);
  return { _id: doc._id, action: 'created' };
}

function newTally() {
  return { created: 0, updated: 0 };
}

function logTally(label, tally) {
  console.log(`  ${label}: ${tally.created} creados, ${tally.updated} actualizados`);
}

async function seed() {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  console.log(`Conectado a MongoDB (base: ${DB_NAME})`);

  const db = client.db(DB_NAME);

  try {
    const categoriesCol = db.collection('categories');
    const mediaCol = db.collection('media');
    const productsCol = db.collection('products');

    // --- Categorías: primero, los productos las referencian por _id --------
    const catTally = newTally();
    const categoryByFixtureId = new Map();

    for (const cat of catalog.categories) {
      const r = await upsertBy(categoriesCol, 'slug', cat.slug, {
        name: cat.name,
        description: cat.description ?? null,
        image: cat.image ?? null,
        parent: null,
        order: typeof cat.order === 'number' ? cat.order : 0,
      });
      catTally[r.action] += 1;
      categoryByFixtureId.set(cat.id, r._id);
    }
    logTally('Categorías', catTally);

    // --- Media: un documento por producto con imagen -----------------------
    const mediaTally = newTally();
    const mediaByFixtureId = new Map();

    for (const product of catalog.products) {
      const url = product.images?.[0]?.image?.url;
      if (!url) continue;
      const r = await upsertBy(mediaCol, 'filename', `${product.slug}.jpg`, {
        filename: `${product.slug}.jpg`,
        url,
        alt: product.images[0].alt || product.name,
        mimeType: 'image/jpeg',
        filesize: 0,
        width: 400,
        height: 400,
      });
      mediaTally[r.action] += 1;
      mediaByFixtureId.set(product.id, r._id);
    }
    logTally('Media', mediaTally);

    // --- Productos ---------------------------------------------------------
    const prodTally = newTally();

    for (const product of catalog.products) {
      const mediaId = mediaByFixtureId.get(product.id);
      const r = await upsertBy(productsCol, 'slug', product.slug, {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? null,
        category: categoryByFixtureId.get(product.category?.id) ?? null,
        images: mediaId ? [{ image: mediaId, alt: product.images[0]?.alt || product.name }] : [],
        stock: product.stock,
        inStock: product.inStock,
        rating: product.rating,
        reviewCount: product.reviewCount,
        newArrival: product.newArrival,
        featured: product.featured,
        ingredients: product.ingredients ?? [],
        benefits: product.benefits ?? [],
        usage: product.usage ?? [],
        features: product.features ?? [],
        createdAt: new Date(product.createdAt).toISOString(),
      });
      prodTally[r.action] += 1;
    }
    logTally('Productos', prodTally);

    const [products, categories] = [
      await productsCol.countDocuments(),
      await categoriesCol.countDocuments(),
    ];
    console.log(
      `Seed idempotente completado. Total en base: ${products} productos, ${categories} categorías.`,
    );
  } finally {
    await client.close();
  }
}

seed().catch((err) => {
  console.error('Seed idempotente fallido:', err);
  process.exit(1);
});
