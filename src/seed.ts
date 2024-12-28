import { UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import prisma from "./App/Common/Prisma";
import config from "./App/config";

export const seedSuperAdmin = async () => {
  try {
    if (!config.superAdmin || !config.superAdminPassword) {
      throw new Error(
        "Super Admin email or password is not defined in the environment variables."
      );
    }
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        email: config.superAdmin,
      },
    });

    if (existingSuperAdmin) {
      console.log("Super Admin already exists!");
    } else {
      const hashedPassword = await bcrypt.hash(config.superAdminPassword, 12);

      const newSuperAdmin = await prisma.user.create({
        data: {
          email: config.superAdmin,
          password: hashedPassword,
          name: "ADMIN",
          role: UserRole.admin,
          needPasswordChange: false,
          status: "ACTIVE",
        },
      });

      console.log("Super Admin created successfully!", newSuperAdmin);
    }
  } catch (err) {
    console.error("Error creating Super Admin:", err);
  } finally {
    await prisma.$disconnect();
  }
};

seedSuperAdmin();
