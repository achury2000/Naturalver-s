import type { CollectionConfig } from 'payload';

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    description: 'Catálogo de productos NATURALVER\'S',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nombre del producto',
    },
    {
      name: 'slug',
      // @ts-ignore - slug field type not in Payload 3 FieldType union
      type: 'slug',
      // @ts-ignore - relationTo expects CollectionSlug but string literal works at runtime
      relationTo: 'name',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Descripción',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      label: 'PRECIO (COP)',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      label: 'PRECIO DE REFERENCIA (tachado)',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      label: 'Categoría',
    },
    {
      name: 'images',
      type: 'array',
      label: 'Imágenes del producto',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
        },
      ],
    },
    {
      name: 'stock',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      label: 'Stock disponible',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'inStock',
      type: 'checkbox',
      defaultValue: true,
      label: 'Disponible',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'features',
      type: 'array',
      fields: [
        {
          name: 'feature',
          type: 'text',
        },
      ],
      label: 'Características',
    },
    {
      name: 'benefits',
      type: 'array',
      fields: [
        {
          name: 'benefit',
          type: 'text',
        },
      ],
      label: 'Beneficios',
    },
    {
      name: 'ingredients',
      type: 'array',
      fields: [
        {
          name: 'ingredient',
          type: 'text',
        },
      ],
      label: 'Ingredientes',
    },
    {
      name: 'usage',
      type: 'array',
      fields: [
        {
          name: 'step',
          type: 'text',
        },
      ],
      label: 'Modo de uso',
    },
    {
      name: 'rating',
      type: 'number',
      min: 0,
      max: 5,
      defaultValue: 4.5,
      label: 'Calificación',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'reviewCount',
      type: 'number',
      defaultValue: 0,
      label: 'Número de reseñas',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Destacado',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'newArrival',
      type: 'checkbox',
      defaultValue: false,
      label: 'Nuevo',
      admin: {
        position: 'sidebar',
      },
    },
  ],
};