// Payload CMS configuration
import { buildConfig } from 'payload';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';
import { Products } from '@/collections/Products';
import { Orders } from '@/collections/Orders';
import { Users } from '@/collections/Users';
import { Pages } from '@/collections/Pages';
import { Categories } from '@/collections/Categories';
import { Media } from '@/collections/Media';

const config = buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/naturalvers',
  }),
  collections: [Products, Orders, Users, Pages, Categories, Media],
  admin: {
    user: 'users',
    meta: {
      titleSuffix: ' - NATURALVER\'S Admin',
    },
  },
  editor: lexicalEditor(),
  sharp,
  typescript: {
    outputFile: 'src/types/payload.ts',
  },
});

export default config;