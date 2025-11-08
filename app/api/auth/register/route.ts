import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { UserModel } from '@/lib/db/models'
import { UserRole } from '@/types'
import { config } from '@/lib/config'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.nativeEnum(UserRole).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, config.security.bcryptRounds)

    // Create user
    const user = await UserModel.create({
      email: validatedData.email,
      passwordHash,
      role: validatedData.role || UserRole.OPERATOR,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
