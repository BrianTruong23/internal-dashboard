import { BadgeCheck, BadgeX, Clock, Package } from "lucide-react";

const orders = [
  {
    id: "ORD001",
    product: "Wireless Headphones",
    customer: "John Smith",
    amount: "$89.99",
    status: "Completed",
    date: "2024-11-25",
  },
  {
    id: "ORD002",
    product: "Smart Watch",
    customer: "Emma Wilson",
    amount: "$299.99",
    status: "Processing",
    date: "2024-11-26",
  },
  {
    id: "ORD003",
    product: "Laptop Stand",
    customer: "Michael Brown",
    amount: "$45.99",
    status: "Completed",
    date: "2024-11-24",
  },
  {
    id: "ORD004",
    product: "USB-C Cable",
    customer: "Sarah Davis",
    amount: "$19.99",
    status: "Shipped",
    date: "2024-11-25",
  },
  {
    id: "ORD005",
    product: "Wireless Mouse",
    customer: "David Lee",
    amount: "$34.99",
    status: "Completed",
    date: "2024-11-23",
  },
];

export default function OrdersPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            Manage and track your store orders
          </p>
        </div>
      </div>
      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Order ID
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">
                      {order.id}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {order.product}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {order.customer}
                    </td>
                    <td className="p-4 align-middle font-semibold">
                      {order.amount}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        {order.status === "Completed" && (
                          <BadgeCheck className="h-4 w-4 text-green-500" />
                        )}
                        {order.status === "Processing" && (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        {order.status === "Shipped" && (
                          <Package className="h-4 w-4 text-blue-500" />
                        )}
                        {order.status}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
