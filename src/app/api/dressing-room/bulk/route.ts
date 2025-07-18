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

    const createdItems = await prisma.dressingRoomItem.createMany({
      data: items.map(item => ({
        userId,
        category: item.category,
        itemDescription: item.description,
        groupId: item.groupId,
        groupName: item.groupName,
        groupDate: item.groupDate ? new Date(item.groupDate) : null,
        groupWeather: item.groupWeather,
        groupTPO: item.groupTPO,
      })),
    });

    return NextResponse.json({ count: createdItems.count });
  } catch (error) {
    console.error('Error creating dressing room items:', error);
    return NextResponse.json(
      { error: 'Failed to create items' },
      { status: 500 }
    );
  }
}