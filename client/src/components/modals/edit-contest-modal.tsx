import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar, Trophy, Clock, Save, Upload, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { ASSETS_URL } from "@/var";

const editContestFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  prizeAmount: z.number().min(0, "Prize amount must be positive"),
  maxParticipants: z.number().optional(),
  bannerImage: z.string().optional(),
  status: z.enum(["upcoming", "active", "completed"]),
}).refine((data) => {
  const now = new Date();
  const startDate = new Date(data.startDate);
  return startDate >= now;
}, {
  message: "Start date cannot be in the past",
  path: ["startDate"],
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

type EditContestForm = z.infer<typeof editContestFormSchema>;

interface EditContestModalProps {
  isOpen: boolean;
  onClose: () => void;
  contest: any;
}

export default function EditContestModal({ isOpen, onClose, contest }: EditContestModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Helper function to get current datetime in local timezone for input min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    const localISOString = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
    return localISOString.slice(0, 16); // Remove seconds and timezone
  };

  const form = useForm<EditContestForm>({
    resolver: zodResolver(editContestFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      prizeAmount: 0,
      maxParticipants: undefined,
      bannerImage: "",
      status: "upcoming",
    },
  });

  // Update form values when contest changes
  useEffect(() => {
    if (contest) {
      const formatDateTimeLocal = (dateString: string) => {
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        return localDate.toISOString().slice(0, 16);
      };

      form.reset({
        title: contest.title || "",
        description: contest.description || "",
        startDate: formatDateTimeLocal(contest.startDate),
        endDate: formatDateTimeLocal(contest.endDate),
        prizeAmount: Number(contest.prizeAmount) || 0,
        maxParticipants: contest.maxParticipants ?? undefined,
        bannerImage: contest.bannerImage || "",
        status: contest.status || "upcoming",
      });
    }
  }, [contest, form]);

  const editContestMutation = useMutation({
    mutationFn: (data: EditContestForm) => {
      const contestData = {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        prizeAmount: data.prizeAmount,
        maxParticipants: data.maxParticipants,
        bannerImage: uploadedImageUrl || data.bannerImage,
        status: data.status,
        prizeCurrency: "USD",
      };

      return apiRequest(`/api/admin/contests/${contest.id}`, {
        method: "PUT",
        body: JSON.stringify(contestData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contests"] });
      toast({
        title: "Success",
        description: "Contest updated successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update contest",
        variant: "destructive",
      });
    },
  });

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch("/api/upload/banner", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      const imageUrl = result.url;
      setUploadedImageUrl(imageUrl);
      form.setValue("bannerImage", imageUrl);

      toast({
        title: "Success",
        description: "Banner image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Update uploadedImageUrl when contest changes
  useEffect(() => {
    if (contest?.bannerImage) {
      setUploadedImageUrl(contest.bannerImage);
    }
  }, [contest]);

  const onSubmit = (data: EditContestForm) => {
    editContestMutation.mutate(data);
  };

  if (!contest) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Edit Contest
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contest Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter contest title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the contest..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Banner Image Upload */}
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {uploadedImageUrl ? (
                    <div className="space-y-2">
                      <img
                        src={`${ASSETS_URL}${uploadedImageUrl}`}
                        alt="Banner preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">Image uploaded successfully</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUploadedImageUrl("");
                            form.setValue("bannerImage", "");
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload or drag and drop banner image
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file);
                          }
                        }}
                        className="hidden"
                        id="banner-upload-edit"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('banner-upload-edit')?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? "Uploading..." : "Choose File"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contest status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dates and Timing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Dates and Timing
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          min={getCurrentDateTime()}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          min={form.watch("startDate") || getCurrentDateTime()}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Prize and Limits */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Prize and Limits
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prizeAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prize Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Participants</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Unlimited"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editContestMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editContestMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Contest
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}