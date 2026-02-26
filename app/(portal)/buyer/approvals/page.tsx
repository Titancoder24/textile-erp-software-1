"use client";

import * as React from "react";
import { CheckCircle, XCircle, Clock, ImageIcon, FlaskConical, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type ApprovalItem = {
  id: string;
  type: "sample" | "lab_dip";
  title: string;
  orderRef: string;
  styleNo: string;
  submittedDate: string;
  colorRef?: string;
  comments?: string;
  photos: number;
};

const PENDING_APPROVALS: ApprovalItem[] = [
  {
    id: "APR-001",
    type: "lab_dip",
    title: "Lab Dip - Navy Blue",
    orderRef: "SO-2026-0021",
    styleNo: "MTS-001",
    submittedDate: "2026-02-22",
    colorRef: "Pantone 19-3832 TCX",
    photos: 3,
  },
  {
    id: "APR-002",
    type: "sample",
    title: "Pre-Production Sample",
    orderRef: "SO-2026-0021",
    styleNo: "MTS-001",
    submittedDate: "2026-02-24",
    comments: "Size set approved. Please check stitching on collar area.",
    photos: 6,
  },
  {
    id: "APR-003",
    type: "lab_dip",
    title: "Lab Dip - Bright Red",
    orderRef: "SO-2026-0018",
    styleNo: "LPS-007",
    submittedDate: "2026-02-25",
    colorRef: "Pantone 18-1660 TCX",
    photos: 4,
  },
];

type ItemStatus = "pending" | "approved" | "rejected";

interface ApprovalCardProps {
  item: ApprovalItem;
  onApprove: (id: string) => void;
  onReject: (id: string, comments: string) => void;
}

function ApprovalCard({ item, onApprove, onReject }: ApprovalCardProps) {
  const [status, setStatus] = React.useState<ItemStatus>("pending");
  const [showRejectForm, setShowRejectForm] = React.useState(false);
  const [rejectComments, setRejectComments] = React.useState("");
  const [rejecting, setRejecting] = React.useState(false);

  const handleApprove = () => {
    setStatus("approved");
    onApprove(item.id);
  };

  const handleRejectSubmit = async () => {
    if (!rejectComments.trim()) {
      toast.error("Please enter rejection comments before submitting.");
      return;
    }
    setRejecting(true);
    await new Promise((r) => setTimeout(r, 600));
    setStatus("rejected");
    setShowRejectForm(false);
    onReject(item.id, rejectComments);
    setRejecting(false);
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-white shadow-sm transition-all",
        status === "approved"
          ? "border-green-200 bg-green-50/30"
          : status === "rejected"
          ? "border-red-200 bg-red-50/30"
          : "border-gray-200"
      )}
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Type icon */}
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                item.type === "lab_dip"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-blue-100 text-blue-600"
              )}
            >
              {item.type === "lab_dip" ? (
                <Droplets className="h-4 w-4" />
              ) : (
                <FlaskConical className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                  {item.title}
                </span>
                <span
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-xs font-semibold",
                    item.type === "lab_dip"
                      ? "border-purple-200 bg-purple-50 text-purple-700"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                  )}
                >
                  {item.type === "lab_dip" ? "Lab Dip" : "Sample"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                Order: <span className="font-medium text-gray-700">{item.orderRef}</span>
                {" "}&#183; Style: <span className="font-medium text-gray-700">{item.styleNo}</span>
              </p>
              {item.colorRef && (
                <p className="mt-0.5 text-xs text-gray-500">
                  Color Ref: <span className="font-medium text-gray-700">{item.colorRef}</span>
                </p>
              )}
              <p className="mt-0.5 text-xs text-gray-400">
                Submitted:{" "}
                {new Date(item.submittedDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Status badge */}
          {status === "approved" && (
            <div className="flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2 py-1">
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs font-semibold text-green-700">Approved</span>
            </div>
          )}
          {status === "rejected" && (
            <div className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1">
              <XCircle className="h-3.5 w-3.5 text-red-600" />
              <span className="text-xs font-semibold text-red-700">Rejected</span>
            </div>
          )}
          {status === "pending" && (
            <div className="flex items-center gap-1 rounded-md border border-yellow-200 bg-yellow-50 px-2 py-1">
              <Clock className="h-3.5 w-3.5 text-yellow-600" />
              <span className="text-xs font-semibold text-yellow-700">Pending</span>
            </div>
          )}
        </div>

        {/* Supplier comments */}
        {item.comments && (
          <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">Factory Note: </span>
              {item.comments}
            </p>
          </div>
        )}

        {/* Photo placeholders */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-gray-500">
            Photos ({item.photos})
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {Array.from({ length: item.photos }).map((_, i) => (
              <div
                key={i}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-100"
                aria-label={`Photo ${i + 1}`}
              >
                <ImageIcon className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        {status === "pending" && !showRejectForm && (
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              onClick={handleApprove}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRejectForm(true)}
              className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        )}

        {/* Reject form */}
        {showRejectForm && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Rejection Comments <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={rejectComments}
                onChange={(e) => setRejectComments(e.target.value)}
                placeholder="Please describe the reason for rejection and any corrective actions required..."
                rows={3}
                className="resize-none text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleRejectSubmit}
                disabled={rejecting || !rejectComments.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {rejecting ? "Submitting..." : "Submit Rejection"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectComments("");
                }}
                disabled={rejecting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BuyerApprovalsPage() {
  const [items, setItems] = React.useState(PENDING_APPROVALS);
  const [actionLog, setActionLog] = React.useState<
    Array<{ id: string; action: "approved" | "rejected"; comments?: string }>
  >([]);

  const pendingCount = items.filter(
    (item) => !actionLog.find((l) => l.id === item.id)
  ).length;

  const handleApprove = (id: string) => {
    setActionLog((prev) => [...prev, { id, action: "approved" }]);
    toast.success("Approval submitted successfully.");
  };

  const handleReject = (id: string, comments: string) => {
    setActionLog((prev) => [...prev, { id, action: "rejected", comments }]);
    toast.error("Rejection submitted. Factory has been notified.");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve or reject samples and lab dips submitted for your orders.
        </p>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-semibold text-gray-900">
            {pendingCount}
          </span>
          <span className="text-sm text-gray-500">
            pending review
          </span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm text-gray-500">
            {actionLog.filter((l) => l.action === "approved").length} approved
          </span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-gray-500">
            {actionLog.filter((l) => l.action === "rejected").length} rejected
          </span>
        </div>
      </div>

      {/* Approval cards */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white py-12 text-center">
            <CheckCircle className="mx-auto h-10 w-10 text-green-400" />
            <p className="mt-2 text-sm font-medium text-gray-700">
              All caught up!
            </p>
            <p className="text-xs text-gray-400">No pending approvals.</p>
          </div>
        ) : (
          items.map((item) => (
            <ApprovalCard
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        )}
      </div>
    </div>
  );
}
