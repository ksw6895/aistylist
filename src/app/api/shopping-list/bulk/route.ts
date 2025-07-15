import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CategoryItem } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, items }: { userId: string; items: CategoryItem[] } = body;

    if (!userId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const createdItems = await prisma.shoppingListItem.createMany({
      data: items.map(item => ({
        userId,
        category: item.category,
        itemDescription: item.description,
      })),
    });

    return NextResponse.json({ count: createdItems.count });
  } catch (error) {
    console.error('Error creating shopping list items:', error);
    return NextResponse.json(
      { error: 'Failed to create items' },
      { status: 500 }
    );
  }
}