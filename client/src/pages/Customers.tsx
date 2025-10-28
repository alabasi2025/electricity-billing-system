import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: customers, isLoading } = trpc.customers.getAll.useQuery();
  const deleteCustomer = trpc.customers.delete.useMutation();

  const filteredCustomers = customers?.filter(
    (customer) =>
      customer.fullName.includes(searchQuery) ||
      customer.phone.includes(searchQuery) ||
      customer.nationalId?.includes(searchQuery)
  );

  const handleDelete = async (customerId: number) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      await deleteCustomer.mutateAsync({ customerId });
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">إدارة العملاء</h1>
            <p className="text-slate-600 mt-1">عرض وإدارة جميع العملاء</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إضافة عميل جديد
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="البحث بالاسم، رقم الهاتف، أو رقم الهوية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة العملاء ({filteredCustomers?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">جاري التحميل...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        #
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        الاسم الكامل
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        رقم الهوية
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        رقم الهاتف
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        المدينة
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">
                        الحالة
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers?.map((customer, index) => (
                      <tr
                        key={customer.customerId}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-600">{index + 1}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {customer.fullName}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {customer.nationalId || "-"}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dir-ltr text-right">
                          {customer.phone}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {customer.city || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              customer.status === "نشط"
                                ? "bg-green-100 text-green-700"
                                : customer.status === "متوقف"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {customer.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(customer.customerId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
