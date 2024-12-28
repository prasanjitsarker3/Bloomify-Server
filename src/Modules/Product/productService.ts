import { Request } from "express";
import { ICloudinaryResponse, IFile } from "../../Helpers/file";
import { fileUploader } from "../../Helpers/fileUploader";
import prisma from "../../App/Common/Prisma";
import { IPaginationOptions } from "../User/userInterface";
import paginationCalculation from "../../Utilities/paginationCalculation";
import { Gender, Prisma } from "@prisma/client";
import { productSearchingField } from "./productInterface";

const createdNewProduct = async (payload: any) => {
  const {
    name,
    price,
    discount,
    totalProduct,
    size,
    type,
    categoryId,
    rating,
    description,
    discussion,
    details,
    images,
  } = payload;

  const formattedPrice = parseFloat(price);
  const formattedDiscount = discount ? parseFloat(discount) : 0;
  const formattedTotalProduct = parseInt(totalProduct, 10);
  const ratingFormate = parseInt(rating, 10);
  const finalPrice =
    formattedPrice - (formattedPrice * formattedDiscount) / 100;

  const newProduct = await prisma.product.create({
    data: {
      name,
      price: finalPrice,
      discount: formattedDiscount,
      totalProduct: formattedTotalProduct,
      size: size.split(","),
      type,
      categoryId,
      rating: ratingFormate,
      description: description,
      discussion: discussion,
      details: details,
      photo: {
        create: images.map((imgUrl: any) => ({
          img: imgUrl,
        })),
      },
    },
    include: {
      photo: true,
    },
  });
  return newProduct;
};

const getAllProductFromDB = async (
  params: any,
  options: IPaginationOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationCalculation(options);
  const { searchTerm, ...filterData } = params;
  const andCondition: Prisma.ProductWhereInput[] = [];
  if (params.searchTerm) {
    andCondition.push({
      OR: productSearchingField.map((field) => ({
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
    isDelete: false,
  });
  const whereCondition: Prisma.ProductWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};
  const result = await prisma.product.findMany({
    where: whereCondition,
    include: {
      category: {
        select: {
          name: true,
        },
      },
      photo: {
        select: {
          id: true,
          img: true,
        },
      },
    },
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
  });
  const total = await prisma.product.count({
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

const getSingleProduct = async (id: string) => {
  const result = await prisma.product.findUniqueOrThrow({
    where: {
      id: id,
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      photo: {
        select: {
          id: true,
          img: true,
        },
      },
    },
  });

  return result;
};

const getSingleProductUpdate = async (payload: any) => {
  const { id, name, price, discount, totalProduct, size, oldImg, images } =
    payload;
  const formattedSize = Array.isArray(size)
    ? size
    : size.split(",").map((s: string) => s.trim());

  const existingProduct = await prisma.product.findUnique({
    where: { id },
    include: { photo: true },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  const existingPhotos = existingProduct.photo;
  const photosToKeep = oldImg.map((img: { id: string }) => img.id);

  const photosToDelete = existingPhotos.filter(
    (photo) => !photosToKeep.includes(photo.id)
  );

  if (photosToDelete.length > 0) {
    await Promise.all(
      photosToDelete.map(async (photo) => {
        await prisma.photo.delete({ where: { id: photo.id } });
      })
    );
  }

  const formattedPrice = parseFloat(price);
  const formattedDiscount = discount ? parseFloat(discount) : 0;

  const finalPrice =
    formattedPrice - (formattedPrice * formattedDiscount) / 100;

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      name,
      price: finalPrice,
      discount: discount ? parseFloat(discount) : 0,
      totalProduct: parseInt(totalProduct, 10),
      size: formattedSize,
      photo: {
        create: images.map((imgUrl: any) => ({
          img: imgUrl,
        })),
      },
    },
    include: { photo: true },
  });

  return updatedProduct;
};

const getSingleProductSoftDelete = async (id: string) => {
  const result = await prisma.product.update({
    where: {
      id: id,
    },
    data: {
      isDelete: true,
    },
  });
  return result;
};

const topProductFromDB = async () => {
  const result = await prisma.product.findMany({
    where: {
      isDelete: false,
    },
    include: {
      photo: true,
    },
    orderBy: {
      sold: "desc",
    },
    take: 10,
  });
  return result;
};

const newProductFromDB = async () => {
  const result = await prisma.product.findMany({
    where: {
      isDelete: false,
    },
    include: {
      photo: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });
  return result;
};

const fetchTopDiscountedProductsFromDB = async () => {
  const result = await prisma.product.findMany({
    where: {
      isDelete: false,
    },
    include: {
      photo: true,
    },
    orderBy: {
      discount: "desc",
    },
    take: 10,
  });
  return result;
};

const cartFilteringData = async () => {
  const result = await prisma.product.findMany({
    where: {
      isDelete: false,
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      photo: {
        select: {
          id: true,
          img: true,
        },
      },
    },
  });
  return result;
};

export const productService = {
  createdNewProduct,
  getAllProductFromDB,
  getSingleProduct,
  getSingleProductUpdate,
  getSingleProductSoftDelete,
  topProductFromDB,
  newProductFromDB,
  fetchTopDiscountedProductsFromDB,
  cartFilteringData,
};
