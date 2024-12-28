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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metaService = void 0;
const client_1 = require("@prisma/client");
const Prisma_1 = __importDefault(require("../../App/Common/Prisma"));
const date_fns_1 = require("date-fns");
const adminDashboardMetaData = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalProduct = yield Prisma_1.default.product.count();
    const totalOrder = yield Prisma_1.default.order.count();
    const totalPending = yield Prisma_1.default.order.count({
        where: {
            status: client_1.OrderStatus.PENDING,
        },
    });
    const totalComplete = yield Prisma_1.default.order.count({
        where: {
            status: client_1.OrderStatus.DELIVERY,
        },
    });
    const totalAmount = yield Prisma_1.default.order.findMany({
        where: {
            status: client_1.OrderStatus.DELIVERY,
        },
        select: {
            totalPrice: true,
        },
    });
    const totalSum = totalAmount.reduce((acc, order) => acc + order.totalPrice, 0);
    const todayConfirmOrder = yield Prisma_1.default.order.count({
        where: {
            status: client_1.OrderStatus.CONFIFM || client_1.OrderStatus.DELIVERY,
            createdAt: {
                gte: (0, date_fns_1.startOfToday)(),
                lte: (0, date_fns_1.endOfToday)(),
            },
        },
    });
    //last SevenDays Data
    const today = new Date();
    const lastSevenDaysData = [];
    // Iterate through the last 7 days
    for (let i = 0; i < 7; i++) {
        const date = (0, date_fns_1.subDays)(today, i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        // Fetch orders for that day
        const orders = yield Prisma_1.default.order.findMany({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: {
                    in: [client_1.OrderStatus.CONFIFM, client_1.OrderStatus.DELIVERY],
                },
            },
            select: {
                totalPrice: true,
            },
        });
        const totalOrderCount = orders.length; // Total orders for the day
        const totalAmount = orders.reduce((acc, order) => acc + order.totalPrice, 0); // Sum of total prices
        lastSevenDaysData.push({
            date: (0, date_fns_1.format)(date, "dd-MM-yyyy"), // Format date as "25-10-2024"
            totalOrder: totalOrderCount,
            totalAmount: totalAmount,
        });
    }
    //Top Five Product
    const topFiveProduct = yield Prisma_1.default.product.findMany({
        select: {
            id: true,
            name: true,
            sold: true,
            photo: {
                select: {
                    img: true,
                },
                take: 1,
            },
        },
        orderBy: {
            sold: "desc",
        },
        take: 5,
    });
    //Monthly Get Data Orginal
    // const monthlyFormateData: Order[] = await prisma.order.findMany({
    //   where: {
    //     status: OrderStatus.CONFIFM || OrderStatus.DELIVERY,
    //   },
    //   select: {
    //     id: true,
    //     createdAt: true,
    //     orderItems: {
    //       select: {
    //         id: true,
    //         quantity: true,
    //       },
    //     },
    //   },
    // });
    // // Step 1: Process and group data by month and year
    // const formattedMonthlyData = monthlyFormateData.reduce<MonthlyData[]>(
    //   (acc, order) => {
    //     const month = format(new Date(order.createdAt), "MMMM"); // Get full month name (e.g., 'October')
    //     const year = format(new Date(order.createdAt), "yyyy"); // Get year (e.g., '2024')
    //     // Calculate total quantity of items in the order
    //     const totalQuantity = order.orderItems.reduce(
    //       (sum, item) => sum + item.quantity,
    //       0
    //     );
    //     // Find if the current month-year combination already exists in the accumulator
    //     const existingEntry = acc.find(
    //       (entry) => entry.month === month && entry.year === year
    //     );
    //     if (existingEntry) {
    //       // If it exists, increase the totalOrder count and total quantity
    //       existingEntry.totalOrder += 1;
    //       existingEntry.totalQuantity += totalQuantity;
    //     } else {
    //       // If it doesn't exist, create a new entry
    //       acc.push({
    //         month,
    //         year,
    //         totalOrder: 1, // Start with 1 since we found one order for this month
    //         totalQuantity: totalQuantity, // Start with the quantity of this order
    //       });
    //     }
    //     return acc;
    //   },
    //   []
    // );
    //Default Monthly data show
    const initializeDefaultMonthlyData = (year) => [
        { month: "January", year, totalOrder: 0, totalQuantity: 0 },
        { month: "February", year, totalOrder: 0, totalQuantity: 0 },
        { month: "March", year, totalOrder: 0, totalQuantity: 0 },
        { month: "April", year, totalOrder: 0, totalQuantity: 0 },
        { month: "May", year, totalOrder: 0, totalQuantity: 0 },
        { month: "June", year, totalOrder: 0, totalQuantity: 0 },
        { month: "July", year, totalOrder: 0, totalQuantity: 0 },
        { month: "August", year, totalOrder: 0, totalQuantity: 0 },
        { month: "September", year, totalOrder: 0, totalQuantity: 0 },
        { month: "October", year, totalOrder: 0, totalQuantity: 0 },
        { month: "November", year, totalOrder: 0, totalQuantity: 0 },
        { month: "December", year, totalOrder: 0, totalQuantity: 0 },
    ];
    // Fetch data from Prisma
    const monthlyFormateData = yield Prisma_1.default.order.findMany({
        where: {
            status: client_1.OrderStatus.CONFIFM || client_1.OrderStatus.DELIVERY,
        },
        select: {
            id: true,
            createdAt: true,
            orderItems: {
                select: {
                    id: true,
                    quantity: true,
                },
            },
        },
    });
    // Get the current year as a string
    const currentYear = new Date().getFullYear().toString();
    const formattedMonthlyData = monthlyFormateData.reduce((acc, order) => {
        const month = (0, date_fns_1.format)(new Date(order.createdAt), "MMMM");
        const year = (0, date_fns_1.format)(new Date(order.createdAt), "yyyy");
        const totalQuantity = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const existingEntry = acc.find((entry) => entry.month === month && entry.year === year);
        if (existingEntry) {
            existingEntry.totalOrder += 1;
            existingEntry.totalQuantity += totalQuantity;
        }
        return acc;
    }, initializeDefaultMonthlyData(currentYear));
    return {
        totalProduct,
        totalOrder,
        totalPending,
        totalComplete,
        totalSum,
        todayConfirmOrder,
        lastSevenDaysData,
        topFiveProduct,
        formattedMonthlyData,
    };
});
const moderatorDashboardData = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalPendingOrder = yield Prisma_1.default.order.count({
        where: {
            status: client_1.OrderStatus.PENDING,
        },
    });
    const totalCompleteOrder = yield Prisma_1.default.order.count({
        where: {
            status: client_1.OrderStatus.DELIVERY,
        },
    });
    const totalCancelOrder = yield Prisma_1.default.order.count({
        where: {
            status: client_1.OrderStatus.REJECTED,
        },
    });
    const todayPendingOrder = yield Prisma_1.default.order.count({
        where: {
            status: client_1.OrderStatus.PENDING,
            createdAt: {
                gte: (0, date_fns_1.startOfToday)(),
                lte: (0, date_fns_1.endOfToday)(),
            },
        },
    });
    const todayConfirmOrder = yield Prisma_1.default.order.count({
        where: {
            status: client_1.OrderStatus.CONFIFM || client_1.OrderStatus.DELIVERY,
            createdAt: {
                gte: (0, date_fns_1.startOfToday)(),
                lte: (0, date_fns_1.endOfToday)(),
            },
        },
    });
    const todayCancelOrder = yield Prisma_1.default.order.count({
        where: {
            status: client_1.OrderStatus.REJECTED,
            createdAt: {
                gte: (0, date_fns_1.startOfToday)(),
                lte: (0, date_fns_1.endOfToday)(),
            },
        },
    });
    return {
        totalPendingOrder,
        totalCompleteOrder,
        totalCancelOrder,
        todayPendingOrder,
        todayConfirmOrder,
        todayCancelOrder,
    };
});
const getMonthlyDataDownload = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const { selectedMonth } = args;
    const [monthName, year] = selectedMonth.split(" ");
    const monthIndex = new Date(Date.parse(`${monthName} 1, ${year}`)).getMonth();
    const startDate = new Date(Number(year), monthIndex, 1);
    const endDate = new Date(Number(year), monthIndex + 1, 0, 23, 59, 59, 999);
    const productCount = yield Prisma_1.default.product.count({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        },
    });
    const orderCount = yield Prisma_1.default.order.count({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        },
    });
    const confirmOrder = yield Prisma_1.default.order.count({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            status: client_1.OrderStatus.CONFIFM,
        },
    });
    const deliveryOrder = yield Prisma_1.default.order.count({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            status: client_1.OrderStatus.DELIVERY,
        },
    });
    const cancelOrder = yield Prisma_1.default.order.count({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            status: client_1.OrderStatus.REJECTED,
        },
    });
    const returnOrder = yield Prisma_1.default.order.count({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            status: client_1.OrderStatus.RETURN,
        },
    });
    const totalProductSell = yield Prisma_1.default.order.aggregate({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            status: {
                in: [client_1.OrderStatus.CONFIFM, client_1.OrderStatus.DELIVERY],
            },
        },
        _sum: {
            totalPrice: true,
        },
    });
    const totalSales = totalProductSell._sum.totalPrice || 0;
    return {
        totalProduct: productCount,
        totalOrder: orderCount,
        totalConfirmOrder: confirmOrder,
        totalDeliveryOrder: deliveryOrder,
        totalCancelOrder: cancelOrder,
        totalReturnOrder: returnOrder,
        totalProductSellAmount: totalSales,
    };
});
exports.metaService = {
    adminDashboardMetaData,
    moderatorDashboardData,
    getMonthlyDataDownload,
};
