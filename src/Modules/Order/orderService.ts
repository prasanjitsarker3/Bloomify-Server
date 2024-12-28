import { OrderStatus, Prisma } from "@prisma/client";
import prisma from "../../App/Common/Prisma";
import paginationCalculation from "../../Utilities/paginationCalculation";
import { IPaginationOptions } from "../User/userInterface";
import {
  confirmOrderSearchingField,
  orderSearchingField,
} from "./orderInterface";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const onlineOrderData = async (payload: any) => {
  console.log("Received payload:", payload);

  const { productOrderData, totalPrice } = payload;

  if (!productOrderData || !totalPrice) {
    throw new Error("Invalid payload: Missing required fields.");
  }

  // Ensure totalPrice is in paise (i.e., multiply by 100)
  const totalAmountInPaise = Math.round(totalPrice * 100);

  // Ensure that the total amount is at least 50 paise (Stripe's minimum requirement)
  const minimumAmount = 50;
  const amountToCharge =
    totalAmountInPaise < minimumAmount ? minimumAmount : totalAmountInPaise;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: productOrderData.map((item: any) => ({
        price_data: {
          currency: "bdt", // Make sure to specify the correct currency
          product_data: {
            name: `Product ${item.productId}`,
            description: `Size: ${item.size || "N/A"}`,
          },
          unit_amount: amountToCharge, // Use the adjusted amount (in paise)
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    console.log("Stripe session created successfully:", session.id);

    return { sessionId: session.id };
  } catch (error: any) {
    console.error("Error creating Stripe session:", error.message, error.raw);
    throw new Error("Failed to create Stripe checkout session.");
  }
};

const createNewOrderInToDB = async (payload: any) => {
  console.log("Payload", payload);
  const order = await prisma.order.create({
    data: {
      name: payload.name,
      address: payload.address,
      contact: String(payload.contactNumber), // Ensure contact is stored as a string
      note: payload.note || "",
      deliveryCharge: payload.deliveryCharge || 60, // Default delivery charge if not provided
      totalPrice: parseFloat(payload.totalPrice), // Ensure totalPrice is a float
      userId: payload.userId,
      orderItems: {
        create: payload.orderItems.map((item: any) => ({
          quantity: item.quantity,
          size: item.size || "", // Ensure size is stored as a string
          product: {
            connect: { id: item.productId }, // Connect to existing product
          },
        })),
      },
    },
  });

  console.log("Created Order", order);
  return order;
};

const getAllOrderFromDB = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationCalculation(options);
  const { searchTerm } = params;
  const andCondition: Prisma.OrderWhereInput[] = [];
  if (searchTerm) {
    andCondition.push({
      OR: orderSearchingField.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  andCondition.push({
    isDeleted: false,
  });
  andCondition.push({
    status: OrderStatus.PENDING,
  });

  const whereCondition: Prisma.OrderWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.order.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      address: true,
      contact: true,
      totalPrice: true,
      deliveryCharge: true,
      discountNow: true,
      status: true,
      isPdf: true,
      createdAt: true,
      orderItems: {
        select: {
          id: true,
          quantity: true,
          size: true,
          product: {
            select: {
              name: true,
              price: true,
              discount: true,
              photo: {
                select: {
                  id: true,
                  img: true,
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });
  const total = await prisma.order.count({
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

const getConfirmOrderFromDB = async (
  params: any,
  options: IPaginationOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationCalculation(options);
  const { searchTerm, ...filterData } = params;
  const andCondition: Prisma.OrderWhereInput[] = [];

  if (searchTerm) {
    andCondition.push({
      OR: confirmOrderSearchingField.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  andCondition.push({
    status: OrderStatus.CONFIFM,
  });

  const whereCondition: Prisma.OrderWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.order.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      address: true,
      contact: true,
      totalPrice: true,
      deliveryCharge: true,
      discountNow: true,
      status: true,
      createdAt: true,
      updateAt: true,
      orderItems: {
        select: {
          id: true,
          quantity: true,
          size: true,
          product: {
            select: {
              name: true,
              price: true,
              photo: {
                select: {
                  id: true,
                  img: true,
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });
  const total = await prisma.order.count({
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

const getDeliveryOrderFromDB = async (
  params: any,
  options: IPaginationOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationCalculation(options);
  const { searchTerm, ...filterData } = params;
  const andCondition: Prisma.OrderWhereInput[] = [];

  if (searchTerm) {
    andCondition.push({
      OR: confirmOrderSearchingField.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  andCondition.push({
    status: OrderStatus.DELIVERY,
  });

  const whereCondition: Prisma.OrderWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.order.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      address: true,
      contact: true,
      totalPrice: true,
      deliveryCharge: true,
      discountNow: true,
      status: true,
      createdAt: true,
      updateAt: true,
      orderItems: {
        select: {
          id: true,
          quantity: true,
          size: true,
          product: {
            select: {
              name: true,
              price: true,
              photo: {
                select: {
                  id: true,
                  img: true,
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });
  const total = await prisma.order.count({
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

const getSingleOrder = async (id: string) => {
  const result = await prisma.order.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      address: true,
      contact: true,
      totalPrice: true,
      deliveryCharge: true,
      discountNow: true,
      status: true,
      isPdf: true,
      createdAt: true,
      orderItems: {
        select: {
          id: true,
          quantity: true,
          size: true,
          product: {
            select: {
              name: true,
              price: true,
              photo: {
                select: {
                  id: true,
                  img: true,
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });
  return result;
};

const updateOrderStatus = async (orderId: string, payload: { status: any }) => {
  const orderData = await prisma.order.findUniqueOrThrow({
    where: {
      id: orderId,
    },
    select: {
      id: true,
      orderItems: {
        select: {
          quantity: true,
          productId: true,
        },
      },
    },
  });

  if (payload.status === "CONFIFM" || payload.status === "DELIVERY") {
    for (const item of orderData.orderItems) {
      await prisma.product.update({
        where: {
          id: item.productId,
        },
        data: {
          sold: { increment: item.quantity },
          totalProduct: { decrement: item.quantity },
        },
      });
    }
  }

  const updateStatus = await prisma.order.update({
    where: {
      id: orderData.id,
    },
    data: {
      status: payload.status,
    },
  });
  return updateStatus;
};

const deleteOrderFromDB = async (orderProductId: string) => {
  const result = await prisma.$transaction(async (prisma) => {
    const orderData = await prisma.order.findUniqueOrThrow({
      where: {
        id: orderProductId,
      },
      select: {
        orderItems: true,
      },
    });

    const deletedOrderProducts = await prisma.orderProduct.deleteMany({
      where: {
        id: {
          in: orderData.orderItems.map((item) => item.id),
        },
      },
    });
    const deletedOrder = await prisma.order.delete({
      where: {
        id: orderProductId,
      },
    });

    return {
      deletedOrderProducts,
      deletedOrder,
    };
  });
  return result;
};

const isPDFDownloadFromDB = async (id: string) => {
  const orderData = await prisma.order.findUniqueOrThrow({
    where: {
      id: id,
    },
  });
  const result = await prisma.order.update({
    where: {
      id: orderData.id,
    },
    data: {
      isPdf: true,
    },
  });
  return result;
};

//Admin Data

const getAllOrderForAdmin = async (
  params: any,
  options: IPaginationOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationCalculation(options);
  const { searchTerm } = params;
  const andCondition: Prisma.OrderWhereInput[] = [];
  if (searchTerm) {
    andCondition.push({
      OR: orderSearchingField.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  andCondition.push({
    isDeleted: false,
  });

  const whereCondition: Prisma.OrderWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.order.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      address: true,
      contact: true,
      totalPrice: true,
      deliveryCharge: true,
      discountNow: true,
      status: true,
      createdAt: true,
      orderItems: {
        select: {
          id: true,
          quantity: true,
          size: true,
          product: {
            select: {
              name: true,
              price: true,
              photo: {
                select: {
                  id: true,
                  img: true,
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });
  const total = await prisma.order.count({
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
//Admin Data

const getAllReturnOrder = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationCalculation(options);
  const { searchTerm } = params;
  const andCondition: Prisma.OrderWhereInput[] = [];
  if (searchTerm) {
    andCondition.push({
      OR: orderSearchingField.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  andCondition.push({
    status: OrderStatus.RETURN,
  });

  const whereCondition: Prisma.OrderWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.order.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      address: true,
      contact: true,
      totalPrice: true,
      deliveryCharge: true,
      discountNow: true,
      status: true,
      createdAt: true,
      orderItems: {
        select: {
          id: true,
          quantity: true,
          size: true,
          product: {
            select: {
              name: true,
              price: true,
              photo: {
                select: {
                  id: true,
                  img: true,
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });
  const total = await prisma.order.count({
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

const updateDeliveryAndDiscount = async (data: {
  id: string;
  delivery?: string;
  discount?: string;
}) => {
  const { id, delivery, discount } = data;

  const orderData = await prisma.order.findUniqueOrThrow({
    where: {
      id: id,
    },
  });

  const currentDeliveryCharge = orderData.deliveryCharge ?? 0;
  const currentDiscountNow = orderData.discountNow ?? 0;

  let newDeliveryCharge = currentDeliveryCharge;
  let discountPrice = currentDiscountNow;
  let calculationTotalPrice = orderData.totalPrice;

  if (delivery || discount) {
    if (delivery) {
      newDeliveryCharge = parseFloat(delivery);
    }
    const previousTotalPrice =
      orderData.totalPrice - currentDeliveryCharge + currentDiscountNow;
    const newTotalPrice = previousTotalPrice + newDeliveryCharge;
    if (discount) {
      const discountPercentage = parseFloat(discount) / 100;
      discountPrice = parseFloat(
        (newTotalPrice * discountPercentage).toFixed(2)
      );
    }
    calculationTotalPrice = newTotalPrice - discountPrice;
  }

  const updatedOrder = await prisma.order.update({
    where: {
      id: orderData.id,
    },
    data: {
      deliveryCharge: newDeliveryCharge,
      discountNow: discountPrice,
      totalPrice: calculationTotalPrice,
    },
  });

  return updatedOrder;
};

export const orderService = {
  onlineOrderData,
  createNewOrderInToDB,
  getAllOrderFromDB,
  getConfirmOrderFromDB,
  getSingleOrder,
  updateOrderStatus,
  deleteOrderFromDB,
  isPDFDownloadFromDB,
  getDeliveryOrderFromDB,
  updateDeliveryAndDiscount,

  //Admin Route
  getAllOrderForAdmin,
  getAllReturnOrder,
};
