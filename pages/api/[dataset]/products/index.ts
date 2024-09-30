import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import ProductService from '@/services/ProductService';

type serviceAvailable = 'small' | 'large';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { query, category, page = '1', productsPerPage = '10', dataset, minPrice, maxPrice, rating } = req.query;

    const normalizedQuery = query?.toString().toLowerCase() || '';
    const normalizedCategory = category?.toString().toLowerCase() || '';

    const pageNumber = parseInt(page as string, 10);
    const itemsPerPage = parseInt(productsPerPage as string, 10);

    const priceRange = {
      min: minPrice ? parseInt(minPrice as string, 10) : undefined,
      max: maxPrice ? parseInt(maxPrice as string, 10) : undefined,
    };

    const ratingStars = rating ? parseInt(rating as string, 10) : undefined;

    const service: ProductService = ProductService.getInstance(dataset as serviceAvailable);

    const products = await service.getPaginatedProducts(
      pageNumber,
      itemsPerPage,
      normalizedQuery,
      normalizedCategory,
      priceRange.min,
      priceRange.max,
      ratingStars
    );

    return res.status(200).json(products);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    return res.status(statusCode).json({ error: errorMessage });
  }
}
