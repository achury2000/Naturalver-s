// @ts-nocheck
import { MongoClient, ObjectId } from 'mongodb';
import { mockProducts, mockCategories } from './fixtures/catalog';

interface MockCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: any;
  parent?: any;
  order: number;
}

interface MockProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: { id: string; name: string };
  images: { image: { url: string }; alt: string }[];
  stock: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  newArrival: boolean;
  featured: boolean;
  ingredients?: string[];
  benefits?: string[];
  usage?: string[];
  features?: string[];
  createdAt: string;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/naturalvers';

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('naturalvers');

    // Insert categories only if they don't exist (idempotent)
    // @ts-ignore - types inferred from JSON, not interfaces
    console.log('Inserting/updating categories...');
    const categoryIds = new Map<string, ObjectId>();
    for (const cat of mockCategories) {
      const existing = await db.collection('categories').findOne({ slug: cat.slug });
      if (!existing) {
        const newId = new ObjectId();
        categoryIds.set(cat.id, newId);
        await db.collection('categories').insertOne({
          _id: newId,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          order: cat.order,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log(`Inserted category: ${cat.name}`);
      } else {
        categoryIds.set(cat.id, existing._id as ObjectId);
        console.log(`Category already exists: ${cat.name}`);
      }
    }

    // Insert media for product images (idempotent by filename)
    console.log('Inserting media...');
    const mediaDocs: any[] = [];
    const imageMap = new Map<string, ObjectId>();

    for (const product of mockProducts) {
      const imageUrl = product.images[0]?.image?.url;
      const alt = product.images[0]?.alt || product.name;

      if (imageUrl) {
        const existingMedia = await db.collection('media').findOne({ filename: `${product.slug}.jpg` });
        if (!existingMedia) {
          const mediaId = new ObjectId();
          mediaDocs.push({
            _id: mediaId,
            filename: `${product.slug}.jpg`,
            url: imageUrl,
            alt,
            mimeType: 'image/jpeg',
            filesize: 0,
            width: 400,
            height: 400,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          imageMap.set(product.id, mediaId);
        } else {
          imageMap.set(product.id, existingMedia._id as ObjectId);
        }
      }
    }

    if (mediaDocs.length > 0) {
      await db.collection('media').insertMany(mediaDocs);
      console.log(`Inserted ${mediaDocs.length} media documents`);
    }

    // Insert products only if they don't exist (idempotent)
// @ts-ignore - types inferred from JSON, not interfaces
    console.log('Inserting/updating products...');
    for (const product of mockProducts) {
      const categoryId = categoryIds.get(product.category?.id || '');
      const mediaId = imageMap.get(product.id) as ObjectId | undefined;

      const existing = await db.collection('products').findOne({ slug: product.slug });
      if (!existing) {
        await db.collection('products').insertOne({
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          category: categoryId,
          images: mediaId
            ? [
                {
                  image: mediaId,
                  alt: product.images[0]?.alt || product.name,
                },
              ]
            : [],
          stock: product.stock,
          inStock: product.inStock,
          rating: product.rating,
          reviewCount: product.reviewCount,
          newArrival: product.newArrival,
          featured: product.featured,
          // @ts-ignore - types inferred from JSON
          ingredients: product.ingredients,
          // @ts-ignore - types inferred from JSON
          benefits: product.benefits,
          // @ts-ignore - types inferred from JSON
          usage: product.usage,
          // @ts-ignore - types inferred from JSON
          features: product.features,
          createdAt: new Date(product.createdAt).toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log(`Inserted product: ${product.name}`);
      } else {
        console.log(`Product already exists: ${product.name}`);
      }
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});