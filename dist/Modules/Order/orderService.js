"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = void 0;
const client_1 = require("@prisma/client");
const Prisma_1 = __importDefault(require("../../App/Common/Prisma"));
const paginationCalculation_1 = __importDefault(require("../../Utilities/paginationCalculation"));
const orderInterface_1 = require("./orderInterface");
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia",
});
const onlineOrderData = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Received payload:", payload);
    const { productOrderData, totalPrice } = payload;
    if (!productOrderData || !totalPrice) {
        throw new Error("Invalid payload: Missing required fields.");
    }
    // Ensure totalPrice is in paise (i.e., multiply by 100)
    const totalAmountInPaise = Math.round(totalPrice * 100);
    // Ensure that the total amount is at least 50 paise (Stripe's minimum requirement)
    const minimumAmount = 50;
    const amountToCharge = totalAmountInPaise < minimumAmount ? minimumAmount : totalAmountInPaise;
    try {
        const session = yield stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: productOrderData.map((item) => ({
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
    }
    catch (error) {
        console.error("Error creating Stripe session:", error.message, error.raw);
        throw new Error("Failed to create Stripe checkout session.");
    }
});
const createNewOrderInToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Payload", payload);
    const order = yield Prisma_1.default.order.create({
        data: {
            name: payload.name,
            address: payload.address,
            contact: String(payload.contactNumber), // Ensure contact is stored as a string
            note: payload.note || "",
            deliveryCharge: payload.deliveryCharge || 60, // Default delivery charge if not provided
            totalPrice: parseFloat(payload.totalPrice), // Ensure totalPrice is a float
            userId: payload.userId,
            orderItems: {
                create: payload.orderItems.map((item) => ({
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
});
const getAllOrderFromDB = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = (0, paginationCalculation_1.default)(options);
    const { searchTerm } = params;
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            OR: orderInterface_1.orderSearchingField.map((field) => ({
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
        status: client_1.OrderStatus.PENDING,
    });
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const result = yield Prisma_1.default.order.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "asc" },
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
    const total = yield Prisma_1.default.order.count({
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
});
const getConfirmOrderFromDB = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = (0, paginationCalculation_1.default)(options);
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            OR: orderInterface_1.confirmOrderSearchingField.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    andCondition.push({
        status: client_1.OrderStatus.CONFIFM,
    });
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const result = yield Prisma_1.default.order.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "asc" },
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
    const total = yield Prisma_1.default.order.count({
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
});
const getDeliveryOrderFromDB = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = (0, paginationCalculation_1.default)(options);
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            OR: orderInterface_1.confirmOrderSearchingField.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    andCondition.push({
        status: client_1.OrderStatus.DELIVERY,
    });
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const result = yield Prisma_1.default.order.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "asc" },
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
    const total = yield Prisma_1.default.order.count({
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
});
const getSingleOrder = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Prisma_1.default.order.findUnique({
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
});
const updateOrderStatus = (orderId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const orderData = yield Prisma_1.default.order.findUniqueOrThrow({
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
            yield Prisma_1.default.product.update({
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
    const updateStatus = yield Prisma_1.default.order.update({
        where: {
            id: orderData.id,
        },
        data: {
            status: payload.status,
        },
    });
    return updateStatus;
});
const deleteOrderFromDB = (orderProductId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const orderData = yield prisma.order.findUniqueOrThrow({
            where: {
                id: orderProductId,
            },
            select: {
                orderItems: true,
            },
        });
        const deletedOrderProducts = yield prisma.orderProduct.deleteMany({
            where: {
                id: {
                    in: orderData.orderItems.map((item) => item.id),
                },
            },
        });
        const deletedOrder = yield prisma.order.delete({
            where: {
                id: orderProductId,
            },
        });
        return {
            deletedOrderProducts,
            deletedOrder,
        };
    }));
    return result;
});
const isPDFDownloadFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const orderData = yield Prisma_1.default.order.findUniqueOrThrow({
        where: {
            id: id,
        },
    });
    const result = yield Prisma_1.default.order.update({
        where: {
            id: orderData.id,
        },
        data: {
            isPdf: true,
        },
    });
    return result;
});
//Admin Data
const getAllOrderForAdmin = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = (0, paginationCalculation_1.default)(options);
    const { searchTerm } = params;
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            OR: orderInterface_1.orderSearchingField.map((field) => ({
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
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const result = yield Prisma_1.default.order.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "asc" },
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
    const total = yield Prisma_1.default.order.count({
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
});
//Admin Data
const getAllReturnOrder = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = (0, paginationCalculation_1.default)(options);
    const { searchTerm } = params;
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            OR: orderInterface_1.orderSearchingField.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    andCondition.push({
        status: client_1.OrderStatus.RETURN,
    });
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const result = yield Prisma_1.default.order.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "asc" },
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
    const total = yield Prisma_1.default.order.count({
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
});
const updateDeliveryAndDiscount = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id, delivery, discount } = data;
    const orderData = yield Prisma_1.default.order.findUniqueOrThrow({
        where: {
            id: id,
        },
    });
    const currentDeliveryCharge = (_a = orderData.deliveryCharge) !== null && _a !== void 0 ? _a : 0;
    const currentDiscountNow = (_b = orderData.discountNow) !== null && _b !== void 0 ? _b : 0;
    let newDeliveryCharge = currentDeliveryCharge;
    let discountPrice = currentDiscountNow;
    let calculationTotalPrice = orderData.totalPrice;
    if (delivery || discount) {
        if (delivery) {
            newDeliveryCharge = parseFloat(delivery);
        }
        const previousTotalPrice = orderData.totalPrice - currentDeliveryCharge + currentDiscountNow;
        const newTotalPrice = previousTotalPrice + newDeliveryCharge;
        if (discount) {
            const discountPercentage = parseFloat(discount) / 100;
            discountPrice = parseFloat((newTotalPrice * discountPercentage).toFixed(2));
        }
        calculationTotalPrice = newTotalPrice - discountPrice;
    }
    const updatedOrder = yield Prisma_1.default.order.update({
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
});
exports.orderService = {
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
