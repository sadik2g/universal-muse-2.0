import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Users, DollarSign, Clock } from "lucide-react";

interface ViewContestModalProps {
  isOpen: boolean;
  onClose: () => void;
  contest: any;
}

export default function ViewContestModal({ isOpen, onClose, contest }: ViewContestModalProps) {
  if (!contest) return null;

  const startDate = new Date(contest.startDate);
  const endDate = new Date(contest.endDate);
  const isActive = endDate > new Date() && startDate <= new Date();
  const isUpcoming = startDate > new Date();

  const getStatusBadge = () => {
    if (contest.status === "completed" || endDate <= new Date()) {
      return <Badge className="bg-gray-500 text-white">Completed</Badge>;
    }
    if (contest.status === "active" || isActive) {
      return <Badge className="bg-green-500 text-white">Active</Badge>;
    }
    if (contest.status === "upcoming" || isUpcoming) {
      return <Badge className="bg-blue-500 text-white">Upcoming</Badge>;
    }
    return <Badge className="bg-gray-400 text-white">Draft</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Contest Details
          </DialogTitle>
        </DialogHeader>
        
       {/* Contest Banner */}
{contest.image && (
  <div className="w-full h-56 rounded-lg overflow-hidden border mb-6">
    <img
      src={
        contest.image.startsWith("http")
          ? contest.image
          : `https://universal-muse-2-0.onrender.com${contest.image}`
      }
      alt="Contest banner"
      className="w-full h-full object-cover"
    />
  </div>
)}


        <div className="space-y-6">
          {/* Contest Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{contest.title}</h2>
              {getStatusBadge()}
            </div>
            <p className="text-gray-600 text-base leading-relaxed">
              {contest.description || "No description provided"}
            </p>
          </div>

          {/* Contest Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Trophy className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                ${isNaN(Number(contest.prizeAmount)) ? 0 : Number(contest.prizeAmount || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Prize Amount</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg text-center">
              <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {isNaN(contest.submissionCount) ? 0 : (contest.submissionCount || 0)}
              </div>
              <div className="text-sm text-gray-600">Submissions</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-gray-600">Duration (days)</div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <Users className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {isNaN(contest.maxParticipants) ? "∞" : (contest.maxParticipants || "∞")}
              </div>
              <div className="text-sm text-gray-600">Max Participants</div>
            </div>
          </div>

          {/* Contest Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Contest Timeline
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Contest Starts</span>
                </div>
                <span className="text-gray-600">
                  {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">Contest Ends</span>
                </div>
                <span className="text-gray-600">
                  {endDate.toLocaleDateString()} at {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Contest Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Contest ID</label>
                <div className="text-gray-900 font-mono text-sm">{contest.id}</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Created Date</label>
                <div className="text-gray-900">
                  {new Date(contest.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Prize Currency</label>
                <div className="text-gray-900">USD</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Entry Fee</label>
                <div className="text-gray-900 font-semibold text-green-600">Free</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-700">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}