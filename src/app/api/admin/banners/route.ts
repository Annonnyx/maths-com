import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

async function isAdminEmail(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { isAdmin: true, email: true }
  });

  if (user?.isAdmin) return true;

  const allowlistedEmail = process.env.ADMIN_EMAIL;
  if (allowlistedEmail && user?.email && user.email.toLowerCase() === allowlistedEmail.toLowerCase()) {
    return true;
  }

  return false;
}

// GET /api/admin/banners - Get all banners (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(await isAdminEmail(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const banners = await prisma.customBanner.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ banners });
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch banners',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/admin/banners - Upload new banner (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(await isAdminEmail(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const isPremium = formData.get('isPremium') === 'true';

    if (!file || !name) {
      return NextResponse.json({ error: 'File and name are required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 });
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 });
    }

    // Get admin user ID
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'png';
    const filename = `banner_${timestamp}.${fileExtension}`;
    const thumbnailFilename = `banner_${timestamp}_thumb.${fileExtension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('banners')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload image to storage',
        details: uploadError.message 
      }, { status: 500 });
    }

    // Upload thumbnail (same image for now, can be optimized later)
    const { data: thumbUploadData, error: thumbUploadError } = await supabase
      .storage
      .from('banners')
      .upload(thumbnailFilename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (thumbUploadError) {
      console.error('Supabase thumbnail upload error:', thumbUploadError);
      // Continue anyway, we have the main image
    }

    // Get public URLs
    const { data: publicUrlData } = supabase
      .storage
      .from('banners')
      .getPublicUrl(filename);

    const { data: thumbPublicUrlData } = supabase
      .storage
      .from('banners')
      .getPublicUrl(thumbnailFilename);

    // Save banner to database
    const banner = await prisma.customBanner.create({
      data: {
        name,
        description: description || null,
        imageUrl: publicUrlData.publicUrl,
        thumbnailUrl: thumbPublicUrlData?.publicUrl || publicUrlData.publicUrl,
        isPremium,
        createdBy: admin.id
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    return NextResponse.json({ banner });
  } catch (error: any) {
    console.error('Error uploading banner:', error);
    return NextResponse.json({ 
      error: 'Failed to upload banner',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/admin/banners/[id] - Update banner (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(await isAdminEmail(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    const { name, description, isPremium, isActive } = await req.json();

    const banner = await prisma.customBanner.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPremium !== undefined && { isPremium }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

// DELETE /api/admin/banners/[id] - Delete banner (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(await isAdminEmail(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    // Get banner info to delete files from storage
    const banner = await prisma.customBanner.findUnique({
      where: { id }
    });

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    // Extract filenames from URLs
    const imageUrl = new URL(banner.imageUrl);
    const thumbnailUrl = banner.thumbnailUrl ? new URL(banner.thumbnailUrl) : null;
    
    const imagePath = imageUrl.pathname.split('/').pop();
    const thumbnailPath = thumbnailUrl ? thumbnailUrl.pathname.split('/').pop() : null;

    // Delete files from Supabase Storage
    if (imagePath) {
      const { error: deleteError } = await supabase
        .storage
        .from('banners')
        .remove([imagePath]);
      
      if (deleteError) {
        console.error('Error deleting image from storage:', deleteError);
      }
    }

    if (thumbnailPath && thumbnailPath !== imagePath) {
      const { error: deleteThumbError } = await supabase
        .storage
        .from('banners')
        .remove([thumbnailPath]);
      
      if (deleteThumbError) {
        console.error('Error deleting thumbnail from storage:', deleteThumbError);
      }
    }

    // Delete banner from database
    await prisma.customBanner.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ 
      error: 'Failed to delete banner',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
