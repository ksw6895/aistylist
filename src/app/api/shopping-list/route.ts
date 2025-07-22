import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { APIResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/error-handler';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return APIResponse.badRequest('User ID required');
  }

  try {
    const items = await prisma.shoppingListItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return APIResponse.success(items, 'Shopping list items fetched successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// Input validation schema
const createItemSchema = z.object({
  userId: z.string().min(1),
  category: z.string().min(1),
  itemDescription: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = createItemSchema.safeParse(body);
    if (!validationResult.success) {
      return APIResponse.badRequest('Invalid request data', validationResult.error.issues);
    }
    
    const { userId, category, itemDescription } = validationResult.data;

    const item = await prisma.shoppingListItem.create({
      data: {
        userId,
        category,
        itemDescription,
      },
    });

    return APIResponse.success(item, 'Item added to shopping list');
  } catch (error) {
    return handleApiError(error);
  }
}