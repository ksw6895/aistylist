import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, requestInfo, weather, recommendationA, recommendationB, selectedOptions } = body;

    const history = await prisma.recommendationHistory.create({
      data: {
        userId,
        requestInfo,
        weather,
        recommendationA,
        recommendationB,
        selectedOptions,
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error saving recommendation history:', error);
    return NextResponse.json(
      { error: 'Failed to save history' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const history = await prisma.recommendationHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching recommendation history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}