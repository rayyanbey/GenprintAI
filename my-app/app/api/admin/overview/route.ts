import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

    const { models } = authResult;
    const { User, Order, Design, sequelize } = models;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalUsers = await User.count();
    const newUsersLastWeek = await User.count({ where: { created_at: { $gte: oneWeekAgo } } });
    
    const totalOrders = await Order.count();
    const newOrdersLastWeek = await Order.count({ where: { order_date: { $gte: oneWeekAgo } } });
    
    const totalRevenueSum = await Order.sum('total_amount') || 0;
    const recentRevenueSum = await Order.sum('total_amount', { where: { order_date: { $gte: oneWeekAgo } } }) || 0;
    
    const totalDesigns = await Design.count();
    const newDesignsLastWeek = await Design.count({ where: { created_at: { $gte: oneWeekAgo } } });

    const recentOrders = await Order.findAll({
      order: [['order_date', 'DESC']],
      limit: 5,
      include: [{ model: User, attributes: ['username', 'email', 'full_name'] }]
    });

    const formattedOrders = recentOrders.map((o: any) => {
      const u = o.User;
      return {
        id: o.id,
        user: u ? (u.full_name || u.username || u.email) : 'Unknown User',
        product: o.product_name || 'Custom Product',
        amount: parseFloat(o.total_amount).toFixed(2),
        status: o.status,
        date: new Date(o.order_date).toLocaleDateString()
      };
    });

    // Dynamic Activity Feed driven from real temporal markers in the DB
    const activityFeed = [];
    if (newOrdersLastWeek > 0) activityFeed.push({ icon: '🛍️', text: `${newOrdersLastWeek} new orders placed this week`, time: 'recently' });
    if (newUsersLastWeek > 0) activityFeed.push({ icon: '👥', text: `${newUsersLastWeek} new users joined this week`, time: 'recently' });
    if (newDesignsLastWeek > 0) activityFeed.push({ icon: '🎨', text: `${newDesignsLastWeek} AI designs generated this week`, time: 'recently' });
    if (activityFeed.length === 0) activityFeed.push({ icon: '👋', text: `System online and monitoring`, time: 'now' });

    // Dynamic weekday orders charting mapped from the last 7 days of raw DB records
    const last7DaysOrders = await Order.findAll({
      where: { order_date: { $gte: oneWeekAgo } },
      attributes: ['order_date', 'status']
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const ordersDataMap: Record<string, { pending: number, shipped: number, delivered: number }> = {};
    
    // Initialize last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      ordersDataMap[dayNames[d.getDay()]] = { pending: 0, shipped: 0, delivered: 0 };
    }

    last7DaysOrders.forEach((o: any) => {
      const day = dayNames[new Date(o.order_date).getDay()];
      if (ordersDataMap[day]) {
        if (o.status === 'delivered') ordersDataMap[day].delivered++;
        else if (o.status === 'shipped') ordersDataMap[day].shipped++;
        else ordersDataMap[day].pending++;
      }
    });

    const ordersData = Object.keys(ordersDataMap).map(day => ({
      day,
      ...ordersDataMap[day]
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalUsersChange: ((newUsersLastWeek / Math.max(totalUsers - newUsersLastWeek, 1)) * 100).toFixed(1),
        totalOrders,
        totalOrdersChange: ((newOrdersLastWeek / Math.max(totalOrders - newOrdersLastWeek, 1)) * 100).toFixed(1),
        totalRevenue: parseFloat(totalRevenueSum || 0),
        totalRevenueChange: ((recentRevenueSum / Math.max(totalRevenueSum - recentRevenueSum, 1)) * 100).toFixed(1),
        totalDesigns,
        totalDesignsChange: ((newDesignsLastWeek / Math.max(totalDesigns - newDesignsLastWeek, 1)) * 100).toFixed(1)
      },
      recentOrders: formattedOrders,
      activityFeed,
      ordersData
    });

  } catch (error: any) {
    console.error('Admin Overview Error:', error);
    return NextResponse.json({ error: 'Failed to fetch overview data' }, { status: 500 });
  }
}
