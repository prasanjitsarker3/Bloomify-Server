import { optionsPaginationFields, userSearchingField } from "./userConstant";
import { Prisma, UserRole, UserStatus } from "@prisma/client";
import prisma from "../../App/Common/Prisma";
import { IPaginationOptions, IUser, TUpdateProfile } from "./userInterface";
import bcrypt from "bcrypt";
import paginationCalculation from "../../Utilities/paginationCalculation";
import { ITokenUser } from "../../App/Common/authType";

const getAllUserFromDB = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationCalculation(options);
  const { searchTerm, ...filterData } = params;
  const andCondition: Prisma.UserWhereInput[] = [];
  if (params.searchTerm) {
    andCondition.push({
      OR: userSearchingField.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  andCondition.push({
    status: UserStatus.ACTIVE || UserStatus.BLOCKED,
  });
  const whereCondition: Prisma.UserWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.user.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : {
            createdAt: "asc",
          },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      needPasswordChange: true,
      status: true,
      createdAt: true,
    },
  });
  const total = await prisma.user.count({
    where: whereCondition,
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const myProfileFromDB = async (user: ITokenUser) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  const profileData = await prisma.user.findUniqueOrThrow({
    where: {
      email: userData.email,
    },
  });

  return profileData;
};

const profileUpdateFromDB = async (id: string, payload: UserStatus) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: id,
    },
  });

  const updatedUser = await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      //@ts-ignore
      status: payload.status,
    },
  });
  return updatedUser;
};
const deletedUser = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const result = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      status: UserStatus.DELETED,
    },
  });
  return result;
};

export const userServices = {
  getAllUserFromDB,
  myProfileFromDB,
  profileUpdateFromDB,
  deletedUser,
};
