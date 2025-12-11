import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/db';
import { createUserSchema, updateUserSchema } from '@/lib/validation/user-schema';

// GET - List all tracked users
export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data: users, error } = await supabase
      .from('tracked_users')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST - Create a new tracked user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parseResult = createUserSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Check for duplicate LinkedIn URL
    const { data: existing } = await supabase
      .from('tracked_users')
      .select('id')
      .eq('linkedin_url', parseResult.data.linkedin_url)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A user with this LinkedIn URL already exists' },
        { status: 409 }
      );
    }

    // Create user
    const { data: user, error } = await supabase
      .from('tracked_users')
      .insert(parseResult.data)
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PUT - Update a tracked user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate update data
    const parseResult = updateUserSchema.safeParse(updateData);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // If updating LinkedIn URL, check for duplicates
    if (parseResult.data.linkedin_url) {
      const { data: existing } = await supabase
        .from('tracked_users')
        .select('id')
        .eq('linkedin_url', parseResult.data.linkedin_url)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'A user with this LinkedIn URL already exists' },
          { status: 409 }
        );
      }
    }

    // Update user
    const { data: user, error } = await supabase
      .from('tracked_users')
      .update(parseResult.data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a tracked user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('tracked_users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
