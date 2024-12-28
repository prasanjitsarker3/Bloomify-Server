import { OrderStatus } from "@prisma/client";
import prisma from "../../App/Common/Prisma";
import { subDays, format, startOfToday, endOfToday } from "date-fns";

interface OrderItem {
  id: string;
  quantity: number;
}

interface Order {
  id: string;
  createdAt: Date; // Correct type here, it should be 'Date' not 'string'
  orderItems: OrderItem[];
}

interface MonthlyData {
  month: string;
  year: string;
  totalOrder: number;
  totalQuantity: number;
}

const adminDashboardMetaData = async () => {
  const totalProduct = await prisma.product.count();
  const totalOrder = await prisma.order.count();
  const totalPending = await prisma.order.count({
    where: {
      status: OrderStatus.PENDING,
    },
  });
  const totalComplete = await prisma.order.count({
    where: {
      status: OrderStatus.DELIVERY,
    },
  });
  const totalAmount = await prisma.order.findMany({
    where: {
      status: OrderStatus.DELIVERY,
    },
    select: {
      totalPrice: true,
    },
  });
  const totalSum = totalAmount.reduce(
    (acc, order) => acc + order.totalPrice,
    0
  );
  const todayConfirmOrder = await prisma.order.count({
    where: {
      status: OrderStatus.CONFIFM || OrderStatus.DELIVERY,
      createdAt: {
        gte: startOfToday(),
        lte: endOfToday(),
      },
    },
  });

  //last SevenDays Data
  const today = new Date();
  const lastSevenDaysData = [];
  // Iterate through the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = subDays(today, i);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    // Fetch orders for that day
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: [OrderStatus.CONFIFM, OrderStatus.DELIVERY],
        },
      },
      select: {
        totalPrice: true,
      },
    });

    const totalOrderCount = orders.length; // Total orders for the day
    const totalAmount = orders.reduce(
      (acc, order) => acc + order.totalPrice,
      0
    ); // Sum of total prices

    lastSevenDaysData.push({
      date: format(date, "dd-MM-yyyy"), // Format date as "25-10-2024"
      totalOrder: totalOrderCount,
      totalAmount: totalAmount,
    });
  }

  //Top Five Product

  const topFiveProduct = await prisma.product.findMany({
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
  const initializeDefaultMonthlyData = (year: string): MonthlyData[] => [
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
  const monthlyFormateData: Order[] = await prisma.order.findMany({
    where: {
      status: OrderStatus.CONFIFM || OrderStatus.DELIVERY,
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

  const formattedMonthlyData = monthlyFormateData.reduce<MonthlyData[]>(
    (acc, order) => {
      const month = format(new Date(order.createdAt), "MMMM");
      const year = format(new Date(order.createdAt), "yyyy");

      const totalQuantity = order.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      const existingEntry = acc.find(
        (entry) => entry.month === month && entry.year === year
      );

      if (existingEntry) {
        existingEntry.totalOrder += 1;
        existingEntry.totalQuantity += totalQuantity;
      }

      return acc;
    },
    initializeDefaultMonthlyData(currentYear)
  );

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
};

const moderatorDashboardData = async () => {
  const totalPendingOrder = await prisma.order.count({
    where: {
      status: OrderStatus.PENDING,
    },
  });
  const totalCompleteOrder = await prisma.order.count({
    where: {
      status: OrderStatus.DELIVERY,
    },
  });
  const totalCancelOrder = await prisma.order.count({
    where: {
      status: OrderStatus.REJECTED,
    },
  });

  const todayPendingOrder = await prisma.order.count({
    where: {
      status: OrderStatus.PENDING,
      createdAt: {
        gte: startOfToday(),
        lte: endOfToday(),
      },
    },
  });
  const todayConfirmOrder = await prisma.order.count({
    where: {
      status: OrderStatus.CONFIFM || OrderStatus.DELIVERY,
      createdAt: {
        gte: startOfToday(),
        lte: endOfToday(),
      },
    },
  });
  const todayCancelOrder = await prisma.order.count({
    where: {
      status: OrderStatus.REJECTED,
      createdAt: {
        gte: startOfToday(),
        lte: endOfToday(),
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
};

const getMonthlyDataDownload = async (args: { selectedMonth: string }) => {
  const { selectedMonth } = args;
  const [monthName, year] = selectedMonth.split(" ");
  const monthIndex = new Date(Date.parse(`${monthName} 1, ${year}`)).getMonth();
  const startDate = new Date(Number(year), monthIndex, 1);
  const endDate = new Date(Number(year), monthIndex + 1, 0, 23, 59, 59, 999);

  const productCount = await prisma.product.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
  const orderCount = await prisma.order.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
  const confirmOrder = await prisma.order.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: OrderStatus.CONFIFM,
    },
  });
  const deliveryOrder = await prisma.order.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: OrderStatus.DELIVERY,
    },
  });
  const cancelOrder = await prisma.order.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: OrderStatus.REJECTED,
    },
  });

  const returnOrder = await prisma.order.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: OrderStatus.RETURN,
    },
  });

  const totalProductSell = await prisma.order.aggregate({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: [OrderStatus.CONFIFM, OrderStatus.DELIVERY],
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
};

export const metaService = {
  adminDashboardMetaData,
  moderatorDashboardData,
  getMonthlyDataDownload,
};
