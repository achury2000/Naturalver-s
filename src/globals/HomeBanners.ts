import type { GlobalConfig } from 'payload';
import { revalidatePath } from 'next/cache';

export const HomeBanners: GlobalConfig = {
  slug: 'home-banners',
  label: {
    singular: 'Banners de inicio',
    plural: 'Banners de inicio',
  },
  admin: {
    group: 'Portada',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slides',
      type: 'array',
      label: 'Slides del carrusel',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'type',
          type: 'select',
          label: 'Tipo de banner',
          defaultValue: 'offer',
          options: [
            { label: 'Oferta', value: 'offer' },
            { label: 'Envíos', value: 'shipping' },
            { label: 'Pago contraentrega', value: 'payment' },
            { label: 'Personalizado', value: 'custom' },
          ],
        },
        {
          name: 'title',
          type: 'text',
          label: 'Título',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Descripción',
        },
        {
          name: 'desktopImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Imagen escritorio',
          required: true,
          filterOptions: {
            mimeType: { contains: 'image' },
          },
        },
        {
          name: 'mobileImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Imagen móvil',
          required: true,
          filterOptions: {
            mimeType: { contains: 'image' },
          },
        },
        {
          name: 'buttonLabel',
          type: 'text',
          label: 'Texto del botón',
        },
        {
          name: 'buttonLink',
          type: 'text',
          label: 'Enlace del botón',
        },
        {
          name: 'note',
          type: 'textarea',
          label: 'Nota legal',
        },
        {
          name: 'showSocialLinks',
          type: 'checkbox',
          label: 'Mostrar redes sociales',
        },
        {
          name: 'active',
          type: 'checkbox',
          label: 'Activo',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'group',
      label: 'Redes sociales',
      fields: [
        {
          name: 'instagram',
          type: 'text',
          label: 'Instagram',
        },
        {
          name: 'facebook',
          type: 'text',
          label: 'Facebook',
        },
        {
          name: 'tiktok',
          type: 'text',
          label: 'TikTok',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async () => {
        revalidatePath('/', 'layout');
      },
    ],
  },
};