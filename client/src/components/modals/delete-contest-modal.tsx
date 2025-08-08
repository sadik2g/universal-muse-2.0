import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DeleteContestModalProps {
  isOpen: boolean;
  onClose: () => void;
  contest: any;
}

export default function DeleteContestModal({ isOpen, onClose, contest }: DeleteContestModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteContestMutation = useMutation({
    mutationFn: () => {
      return apiRequest(`/api/admin/contests/${contest.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contests"] });
      toast({
        title: "Success",
        description: "Contest deleted successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete contest",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteContestMutation.mutate();
  };

  if (!contest) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Contest
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Warning: This action cannot be undone</h3>
                <p className="text-sm text-red-700 mt-1">
                  Deleting this contest will permanently remove all associated data including:
                </p>
                <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                  <li>Contest information and settings</li>
                  <li>All participant submissions</li>
                  <li>Vote records and statistics</li>
                  <li>Contest history and analytics</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Contest to be deleted:</h4>
            <div className="space-y-1">
              <div className="text-lg font-semibold text-gray-900">{contest.title}</div>
              <div className="text-sm text-gray-600">
                ID: {contest.id} | Submissions: {contest.submissionCount || 0}
              </div>
              <div className="text-sm text-gray-600">
                Created: {new Date(contest.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Are you absolutely sure you want to delete this contest? This action will immediately remove the contest from both the admin panel and public website.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={deleteContestMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              disabled={deleteContestMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteContestMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Contest
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}