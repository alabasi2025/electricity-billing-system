import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { Activity, Users, Zap, FileText, DollarSign, AlertCircle } from "lucide-react";

export default function Home() {
  const { data: customers } = trpc.customers.list.useQuery();
  const { data: meters } = trpc.meters.list.useQuery();
  const { data: invoices } = trpc.bills.list.useQuery();
  const { data: payments } = trpc.payments.list.useQuery();
  const { data: complaints } = trpc.complaints.list.useQuery();

  const stats = [
    {
      title: "إجمالي العملاء",
      value: customers?.length || 0,
      icon: Users,
      description: "عدد العملاء المسجلين",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "العدادات النشطة",
      value: meters?.filter((m: any) => m.status === "active").length || 0,
      icon: Zap,
      description: "عدادات قيد التشغيل",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "الفواتير المعلقة",
      value: invoices?.filter((i: any) => i.status === "pending").length || 0,
      icon: FileText,
      description: "فواتير لم تُدفع بعد",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "إجمالي المدفوعات",
      value: payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0).toFixed(2) || "0.00",
      icon: DollarSign,
      description: "المبلغ الإجمالي المحصل",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      suffix: " ريال",
    },
    {
      title: "الشكاوى الجديدة",
      value: complaints?.filter((c: any) => c.status === "جديدة").length || 0,
      icon: AlertCircle,
      description: "شكاوى تحتاج معالجة",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "إجمالي العدادات",
      value: meters?.length || 0,
      icon: Activity,
      description: "جميع العدادات المسجلة",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            نظام فوترة عدادات الكهرباء
          </h1>
          <p className="text-slate-600">
            لوحة التحكم الرئيسية - نظرة عامة على النظام
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-800">
                    {stat.value}{stat.suffix || ""}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                آخر الفواتير
              </CardTitle>
              <CardDescription>أحدث 5 فواتير في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices?.slice(0, 5).map((invoice: any) => (
                  <div
                    key={invoice.invoiceId}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {invoice.invoiceNumber}
                      </p>
                      <p className="text-sm text-slate-500">
                        العميل #{invoice.customerId}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800">
                        {Number(invoice.totalAmount).toFixed(2)} ريال
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          invoice.status === "مدفوعة"
                            ? "bg-green-100 text-green-700"
                            : invoice.status === "معلقة"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Complaints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                آخر الشكاوى
              </CardTitle>
              <CardDescription>أحدث 5 شكاوى في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complaints?.slice(0, 5).map((complaint: any) => (
                  <div
                    key={complaint.complaintId}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">
                        {complaint.subject}
                      </p>
                      <p className="text-sm text-slate-500">
                        {complaint.complaintType} - العميل #{complaint.customerId}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        complaint.status === "محلولة"
                          ? "bg-green-100 text-green-700"
                          : complaint.status === "قيد المعالجة"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {complaint.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
            <CardDescription>الوصول السريع للعمليات الشائعة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/customers"
                className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
              >
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="font-medium text-slate-800">إدارة العملاء</p>
              </a>
              <a
                href="/meters"
                className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
              >
                <Zap className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="font-medium text-slate-800">إدارة العدادات</p>
              </a>
              <a
                href="/invoices"
                className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center"
              >
                <FileText className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="font-medium text-slate-800">إدارة الفواتير</p>
              </a>
              <a
                href="/complaints"
                className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-center"
              >
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <p className="font-medium text-slate-800">إدارة الشكاوى</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
