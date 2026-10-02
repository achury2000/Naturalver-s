import config from '@payload-config';
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes';

type NextContext = { params: Promise<{ slug?: string[] }> };

const getHandler = REST_GET(config);
const postHandler = REST_POST(config);
const putHandler = REST_PUT(config);
const patchHandler = REST_PATCH(config);
const deleteHandler = REST_DELETE(config);
const optionsHandler = REST_OPTIONS(config);

export async function GET(request: Request, { params }: NextContext) {
  const { slug = [] } = await params;
  return getHandler(request, { params: Promise.resolve({ slug }) });
}

export async function POST(request: Request, { params }: NextContext) {
  const { slug = [] } = await params;
  return postHandler(request, { params: Promise.resolve({ slug }) });
}

export async function PUT(request: Request, { params }: NextContext) {
  const { slug = [] } = await params;
  return putHandler(request, { params: Promise.resolve({ slug }) });
}

export async function PATCH(request: Request, { params }: NextContext) {
  const { slug = [] } = await params;
  return patchHandler(request, { params: Promise.resolve({ slug }) });
}

export async function DELETE(request: Request, { params }: NextContext) {
  const { slug = [] } = await params;
  return deleteHandler(request, { params: Promise.resolve({ slug }) });
}

export async function OPTIONS(request: Request, { params }: NextContext) {
  const { slug = [] } = await params;
  return optionsHandler(request, { params: Promise.resolve({ slug }) });
}