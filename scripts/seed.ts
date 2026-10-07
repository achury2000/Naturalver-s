import { MongoClient, ObjectId } from 'mongodb';
import { mockProducts, mockCategories, mockHomeBanners } from './fixtures/catalog';

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

    // Clear existing collections
    console.log('Clearing existing collections...');
    await db.collection('products').deleteMany({});
    await db.collection('categories').deleteMany({});
    await db.collection('media').deleteMany({});

    // Insert categories with new ObjectIds
    console.log('Inserting categories...');
    const categoryIds = new Map<string, ObjectId>();
    const categoriesWithIds = mockCategories.map((cat: MockCategory) => {
      const newId = new ObjectId();
      categoryIds.set(cat.id, newId);
      return {
        _id: newId,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        parent: cat.parent,
        order: cat.order,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
    await db.collection('categories').insertMany(categoriesWithIds);
    console.log(`Inserted ${categoriesWithIds.length} categories`);

    // Insert media for product images
    console.log('Inserting media...');
    const mediaDocs: any[] = [];
    const imageMap = new Map<string, ObjectId>(); // product.id -> mediaId

    for (const product of mockProducts) {
      const imageUrl = product.images[0]?.image?.url;
      const alt = product.images[0]?.alt || product.name;

      if (imageUrl) {
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
      }
    }

    if (mediaDocs.length > 0) {
      await db.collection('media').insertMany(mediaDocs);
      console.log(`Inserted ${mediaDocs.length} media documents`);
    }

    // Insert products with ObjectId relationships
    console.log('Inserting products...');
    const productsWithRelations = mockProducts.map((product: MockProduct) => {
      const categoryId = categoryIds.get(product.category?.id || '');
      const mediaId = imageMap.get(product.id);

      return {
        _id: new ObjectId(),
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
        ingredients: product.ingredients,
        benefits: product.benefits,
        usage: product.usage,
        features: product.features,
        createdAt: new Date(product.createdAt).toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    await db.collection('products').insertMany(productsWithRelations);
    console.log(`Inserted ${productsWithRelations.length} products`);

    // Insert the home-banners global. Payload stores globals in the `globals`
    // collection keyed by `globalType` (the global slug), not by a `slug` field.
    console.log('Inserting home-banners global...');
    const bannerSlides = mockHomeBanners.slides.map((slide: any) => {
      const desktopId = imageMap.get(slide.desktopImage?.productId);
      const mobileId = imageMap.get(slide.mobileImage?.productId);
      return {
        type: slide.type,
        title: slide.title,
        description: slide.description,
        desktopImage: desktopId ?? undefined,
        mobileImage: mobileId ?? undefined,
        buttonLabel: slide.buttonLabel,
        buttonLink: slide.buttonLink,
        note: slide.note,
        showSocialLinks: slide.showSocialLinks,
        active: slide.active,
      };
    });

    await db.collection('globals').deleteMany({ globalType: 'home-banners' });
    await db.collection('globals').insertOne({
      _id: new ObjectId(),
      globalType: 'home-banners',
      slides: bannerSlides,
      socialLinks: mockHomeBanners.socialLinks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`Inserted home-banners global with ${bannerSlides.length} slides`);

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