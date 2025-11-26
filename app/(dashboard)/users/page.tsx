import { Shield, User, Store } from "lucide-react";

const usersWithStores = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "Admin",
    status: "Active",
    storeCount: 2,
    stores: ["Fashion Boutique", "Tech Gadgets Store"],
    joinedDate: "2024-01-15",
  },
  {
    id: "2",
    name: "John Merchant",
    email: "john@example.com",
    role: "User",
    status: "Active",
    storeCount: 1,
    stores: ["Organic Foods Market"],
    joinedDate: "2024-03-10",
  },
  {
    id: "3",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    role: "User",
    status: "Active",
    storeCount: 2,
    stores: ["Beauty & Wellness", "Home Decor Shop"],
    joinedDate: "2024-11-18",
  },
  {
    id: "4",
    name: "Mike Chen",
    email: "mike.c@example.com",
    role: "User",
    status: "Active",
    storeCount: 1,
    stores: ["Sports Equipment Co"],
    joinedDate: "2024-11-19",
  },
  {
    id: "5",
    name: "Emily Davis",
    email: "emily.d@example.com",
    role: "User",
    status: "Active",
    storeCount: 3,
    stores: ["Pet Supplies Plus", "Kids Toys & Games", "Book Haven"],
    joinedDate: "2024-11-20",
  },
];

export default function UsersPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Registered Users</h2>
          <p className="text-muted-foreground">
            Manage users and their store listings
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
                    User
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Stores
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Store Names
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Joined
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {usersWithStores.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {user.email}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{user.storeCount}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-1">
                        {user.stores.map((store, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-secondary px-2 py-1 rounded-md inline-block"
                          >
                            {store}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        {user.role === "Admin" && (
                          <Shield className="h-4 w-4 text-blue-500" />
                        )}
                        {user.role}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {new Date(user.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        {user.status}
                      </span>
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
