"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Info, ImageIcon, LayoutGrid } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface Request {
  id: number;
  title: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  requester: string;
  type: string;
}

const RequestGrid = () => {
  const t = useTranslations("dashboard.requests");
  const [requests] = useState<Request[]>([
    {
      id: 1,
      title: "EPD Verification Request",
      status: "pending",
      date: "2024-03-20",
      requester: "John Doe",
      type: "Verification",
    },
    {
      id: 2,
      title: "Product Assessment",
      status: "approved",
      date: "2024-03-19",
      requester: "Jane Smith",
      type: "Assessment",
    },
    // Add more sample data as needed
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.title")}</TableHead>
              <TableHead>{t("columns.status")}</TableHead>
              <TableHead>{t("columns.date")}</TableHead>
              <TableHead>{t("columns.requester")}</TableHead>
              <TableHead>{t("columns.type")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.title}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(request.status)}>
                    {t(`status.${request.status}`)}
                  </Badge>
                </TableCell>
                <TableCell>{request.date}</TableCell>
                <TableCell>{request.requester}</TableCell>
                <TableCell>{request.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export { RequestGrid };
