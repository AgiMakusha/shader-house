import { NextRequest, NextResponse } from "next/server";
import { registerSchema, developerRegistrationSchema } from "@/lib/auth/validation";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { checkIndieEligibility } from "@/lib/indie/eligibility";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is a developer registration with profile
    const isDeveloperWithProfile = body.role === "developer" && body.developerProfile;
    
    // Validate input
    const validation = isDeveloperWithProfile 
      ? developerRegistrationSchema.safeParse(body)
      : registerSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;
    const developerProfile = isDeveloperWithProfile ? body.developerProfile : null;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get client IP for attestation
    const clientIP = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";

    // Check indie eligibility if developer profile provided
    let isIndieEligible = false;
    if (developerProfile) {
      const eligibility = checkIndieEligibility({
        teamSize: developerProfile.teamSize,
        hasPublisher: developerProfile.hasPublisher,
        ownsIP: developerProfile.ownsIP,
        companyType: developerProfile.companyType,
        fundingSources: developerProfile.fundingSources,
      });
      isIndieEligible = eligibility.isEligible;
    }

    // Create user in database with developer profile if provided
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role: role.toUpperCase() as "DEVELOPER" | "GAMER",
        ...(developerProfile && {
          developerProfile: {
            create: {
              developerType: developerProfile.developerType,
              teamSize: developerProfile.teamSize,
              hasPublisher: developerProfile.hasPublisher,
              ownsIP: developerProfile.ownsIP,
              fundingSources: developerProfile.fundingSources,
              companyType: developerProfile.companyType,
              evidenceLinks: developerProfile.evidenceLinks,
              attestIndie: developerProfile.attestIndie,
              attestedIP: clientIP,
              isIndieEligible,
              verificationStatus: "PENDING",
            },
          },
        }),
      },
    });

    // Create session (auto-login after registration)
    await createSession({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role.toLowerCase() as "developer" | "gamer",
      createdAt: newUser.createdAt.getTime(),
    }, true); // Remember me = true by default for new registrations

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      ...(developerProfile && {
        verificationStatus: "PENDING",
        isIndieEligible,
      }),
    });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}

