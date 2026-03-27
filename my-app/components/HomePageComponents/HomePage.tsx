'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Package,
  Palette,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { SafeAvatar } from '@/components/ui/safe-image';

type OrderStatus = 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'payment_failed' | string;

interface OrderSummary {
  id: string;
  order_date: string;
  status: OrderStatus;
  total_amount: number;
  quantity: number;
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
}

interface DesignSummary {
  id: string;
  title: string;
  artwork_file_url?: string;
  created_at: string;
  approval_status: string;
  admin_feedback?: string | null;
  admin_feedback_date?: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Payment Pending',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  payment_failed: 'Payment Failed',
};

function statusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'paid' || status === 'delivered') {
    return 'default';
  }
  if (status === 'payment_failed') {
    return 'destructive';
  }
  if (status === 'pending_payment' || status === 'processing') {
    return 'secondary';
  }
  return 'outline';
}

function safeDate(value?: string | null): string {
  if (!value) {
    return 'N/A';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }
  return date.toLocaleString();
}

export default function HomePage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [designs, setDesigns] = useState<DesignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setError(null);

    try {
      const [ordersRes, designsRes] = await Promise.all([
        fetch('/api/orders?page=1&limit=8', { cache: 'no-store' }),
        fetch('/api/user/designs?page=1&limit=12', { cache: 'no-store' }),
      ]);

      const [ordersJson, designsJson] = await Promise.all([
        ordersRes.json(),
        designsRes.json(),
      ]);

      if (!ordersRes.ok || !ordersJson?.success) {
        throw new Error(ordersJson?.error || 'Failed to load orders');
      }

      if (!designsRes.ok || !designsJson?.success) {
        throw new Error(designsJson?.error || 'Failed to load designs');
      }

      setOrders(Array.isArray(ordersJson.orders) ? ordersJson.orders : []);
      setDesigns(Array.isArray(designsJson.designs) ? designsJson.designs : []);
    } catch (loadError: any) {
      setError(loadError?.message || 'Failed to load dashboard data');
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      setLoading(true);
      await loadDashboardData();
      if (mounted) {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const feedbackNotifications = useMemo(
    () =>
      designs
        .filter((design) => typeof design.admin_feedback === 'string' && design.admin_feedback.trim().length > 0)
        .sort((a, b) => {
          const aDate = new Date(a.admin_feedback_date || a.created_at).getTime();
          const bDate = new Date(b.admin_feedback_date || b.created_at).getTime();
          return bDate - aDate;
        }),
    [designs]
  );

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
    [orders]
  );

  const pendingOrdersCount = useMemo(
    () => orders.filter((order) => order.status === 'pending_payment' || order.status === 'processing').length,
    [orders]
  );

  const approvedDesignsCount = useMemo(
    () => designs.filter((design) => design.approval_status === 'approved').length,
    [designs]
  );

  const paidOrdersCount = useMemo(
    () => orders.filter((order) => order.status === 'paid' || order.status === 'delivered').length,
    [orders]
  );

  const failedOrdersCount = useMemo(
    () => orders.filter((order) => order.status === 'payment_failed').length,
    [orders]
  );

  const pendingDesignsCount = useMemo(
    () => designs.filter((design) => design.approval_status === 'pending').length,
    [designs]
  );

  const rejectedDesignsCount = useMemo(
    () => designs.filter((design) => design.approval_status === 'rejected').length,
    [designs]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7f6] via-[#fffdfc] to-[#ffffff]">
      <section className="border-b border-[#fbc4ab]/60 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Client Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Track your orders, manage designs, and review admin feedback notifications.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="border-[#f8ad9d] text-[#b4534f] hover:bg-[#fff1ee]"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button asChild className="bg-[#f4978e] text-white hover:bg-[#f08080]">
                <Link href="/design-studio">Create New Design</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<ShoppingBag className="h-4 w-4" />}
            title="Total Orders"
            value={orders.length}
            subtitle={`${pendingOrdersCount} active`}
          />
          <StatCard
            icon={<Package className="h-4 w-4" />}
            title="Total Spent"
            value={`$${totalSpent.toFixed(2)}`}
            subtitle="Across all orders"
          />
          <StatCard
            icon={<Palette className="h-4 w-4" />}
            title="Designs"
            value={designs.length}
            subtitle={`${approvedDesignsCount} approved`}
          />
          <StatCard
            icon={<Bell className="h-4 w-4" />}
            title="Feedback Alerts"
            value={feedbackNotifications.length}
            subtitle="From admin"
          />
        </section>

        {feedbackNotifications.length > 0 && (
          <section className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-600" />
              <h2 className="text-sm font-semibold text-gray-900">New Admin Feedback</h2>
              <Badge variant="secondary">{feedbackNotifications.length}</Badge>
            </div>
            <div className="space-y-3">
              {feedbackNotifications.slice(0, 3).map((notification) => (
                <div key={`feedback-top-${notification.id}`} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-amber-900">{notification.title}</p>
                      <p className="mt-1 text-sm text-amber-800">{notification.admin_feedback}</p>
                    </div>
                    <Badge variant="outline">{safeDate(notification.admin_feedback_date)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-[#fbc4ab]/70 bg-white p-4 shadow-sm">
          <Tabs defaultValue="overview" className="gap-4">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="designs">Designs</TabsTrigger>
              <TabsTrigger value="notifications">Feedback Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {loading ? (
                <p className="text-sm text-gray-600">Loading dashboard data...</p>
              ) : error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Panel title="Latest Orders" actionHref="/orders" actionLabel="View all">
                      {orders.length === 0 ? (
                        <EmptyLine label="No orders yet." />
                      ) : (
                        <div className="space-y-3">
                          {orders.slice(0, 4).map((order) => (
                            <OrderRow key={order.id} order={order} />
                          ))}
                        </div>
                      )}
                    </Panel>

                    <Panel title="Latest Designs" actionHref="/my-designs" actionLabel="View all">
                      {designs.length === 0 ? (
                        <EmptyLine label="No designs yet." />
                      ) : (
                        <div className="space-y-3">
                          {designs.slice(0, 4).map((design) => (
                            <DesignRow key={design.id} design={design} />
                          ))}
                        </div>
                      )}
                    </Panel>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Panel title="Order Pipeline Insights" actionHref="/orders" actionLabel="Open orders">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <MiniInsight title="Paid" value={paidOrdersCount} tone="success" />
                        <MiniInsight title="Active" value={pendingOrdersCount} tone="warning" />
                        <MiniInsight title="Failed" value={failedOrdersCount} tone="danger" />
                      </div>
                    </Panel>

                    <Panel title="Design Approval Insights" actionHref="/my-designs" actionLabel="Open designs">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <MiniInsight title="Approved" value={approvedDesignsCount} tone="success" />
                        <MiniInsight title="Pending" value={pendingDesignsCount} tone="warning" />
                        <MiniInsight title="Needs Revision" value={rejectedDesignsCount} tone="danger" />
                      </div>
                    </Panel>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="orders">
              <Panel title="Order History">
                {loading ? (
                  <EmptyLine label="Loading orders..." />
                ) : orders.length === 0 ? (
                  <EmptyLine label="No orders found." />
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <OrderRow key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="designs">
              <Panel title="My Designs" actionHref="/my-designs" actionLabel="Open my designs">
                {loading ? (
                  <EmptyLine label="Loading designs..." />
                ) : designs.length === 0 ? (
                  <EmptyLine label="No designs found." />
                ) : (
                  <div className="space-y-3">
                    {designs.map((design) => (
                      <DesignRow key={design.id} design={design} />
                    ))}
                  </div>
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="notifications">
              <Panel title="Admin Feedback Notifications">
                {loading ? (
                  <EmptyLine label="Loading notifications..." />
                ) : feedbackNotifications.length === 0 ? (
                  <EmptyLine label="No admin feedback yet." />
                ) : (
                  <div className="space-y-3">
                    {feedbackNotifications.map((notification) => (
                      <div
                        key={`feedback-${notification.id}`}
                        className="rounded-lg border border-amber-200 bg-amber-50 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-amber-900">{notification.title}</p>
                          <Badge variant="outline">{safeDate(notification.admin_feedback_date)}</Badge>
                        </div>
                        <p className="text-sm text-amber-800">{notification.admin_feedback}</p>
                        <div className="mt-3">
                          <Button size="sm" variant="outline" asChild>
                            <Link href="/my-designs">Open Design Workspace</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <div className="rounded-xl border border-[#fbc4ab]/60 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <Avatar className="size-8">
          <AvatarFallback className="bg-[#ffe8e2] text-[#b4534f]">{icon}</AvatarFallback>
        </Avatar>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

function Panel({
  title,
  children,
  actionHref,
  actionLabel,
}: {
  title: string;
  children: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-[#fbc4ab]/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {actionHref && actionLabel ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </div>
      <Separator className="mb-3" />
      {children}
    </div>
  );
}

function EmptyLine({ label }: { label: string }) {
  return (
    <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-gray-500">{label}</p>
  );
}

function MiniInsight({
  title,
  value,
  tone,
}: {
  title: string;
  value: number;
  tone: 'success' | 'warning' | 'danger';
}) {
  const toneClasses: Record<'success' | 'warning' | 'danger', string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    danger: 'border-rose-200 bg-rose-50 text-rose-800',
  };

  return (
    <div className={`rounded-lg border p-3 ${toneClasses[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wide">{title}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function OrderRow({ order }: { order: OrderSummary }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <SafeAvatar
            src={order.product?.image}
            alt={order.product?.name || 'Product'}
            fallback={(order.product?.name || 'P').charAt(0).toUpperCase()}
            size="md"
            className="border"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{order.product?.name || 'Custom Product'}</p>
            <p className="text-xs text-gray-500">Order #{order.id}</p>
            <p className="text-xs text-gray-500">
              Qty {order.quantity} • Unit ${Number(order.product?.price || 0).toFixed(2)}
            </p>
          </div>
        </div>
        <Badge variant={statusBadgeVariant(order.status)}>
          {STATUS_LABELS[order.status] || order.status}
        </Badge>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
        <span>{safeDate(order.order_date)}</span>
        <span className="font-semibold text-gray-900">${Number(order.total_amount || 0).toFixed(2)}</span>
      </div>
    </div>
  );
}

function DesignRow({ design }: { design: DesignSummary }) {
  const hasFeedback = typeof design.admin_feedback === 'string' && design.admin_feedback.trim().length > 0;

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <SafeAvatar
            src={design.artwork_file_url}
            alt={design.title}
            fallback={design.title.charAt(0).toUpperCase()}
            size="md"
            className="border"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{design.title}</p>
            <p className="text-xs text-gray-500">Created {safeDate(design.created_at)}</p>
            <p className="text-xs text-gray-500">Status: {design.approval_status}</p>
          </div>
        </div>
        <Badge variant={hasFeedback ? 'secondary' : 'outline'}>
          {hasFeedback ? 'Feedback Available' : design.approval_status}
        </Badge>
      </div>

      {hasFeedback ? (
        <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
          <div className="mb-1 flex items-center gap-1 font-semibold">
            <Clock className="h-3.5 w-3.5" />
            Admin Feedback
          </div>
          <p>{design.admin_feedback}</p>
          <p className="mt-1 text-[11px] text-amber-700">{safeDate(design.admin_feedback_date)}</p>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-1 text-xs text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          No new admin feedback
        </div>
      )}
    </div>
  );
}
