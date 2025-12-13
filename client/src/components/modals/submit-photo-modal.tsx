import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Camera, Upload, Clock, Send, CheckCircle, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Label } from "recharts";
import { ASSETS_URL } from "@/var";

const submitPhotoSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  photoUrl: z.string().min(1, "Please upload a photo"),
});

type SubmitPhotoForm = z.infer<typeof submitPhotoSchema>;

interface SubmitPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contest: any;
}

export default function SubmitPhotoModal({ isOpen, onClose, contest }: SubmitPhotoModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<SubmitPhotoForm>({
    resolver: zodResolver(submitPhotoSchema),
    defaultValues: {
      title: "",
      description: "",
      photoUrl: "",
    },
  });
  console.log("uploadedFile:::", uploadedFile)
  const submitPhotoMutation = useMutation({
    mutationFn: (data: SubmitPhotoForm) => {
      return apiRequest("/api/contest-entries", {
        method: "POST",
        body: JSON.stringify({
          contestId: parseInt(contest.id),
          title: data.title,
          description: data.description,
          photoUrl: data.photoUrl,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contests"] });
      toast({
        title: "Success",
        description: "Photo submitted for review! You'll be notified once it's approved.",
      });
      form.reset();
      setUploadedFile(null);
      onClose();
    },
    onError: (error: any) => {
      console.error("Photo submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (file: File) => {

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 10MB",
        variant: "destructive",
      });
      return;
    }
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
      setUploadedFile(imageUrl);
      form.setValue("photoUrl", imageUrl);

      toast({
        title: "Success",
        description: "Banner image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: SubmitPhotoForm) => {
    console.log("Submitting photo with data:", data);
    submitPhotoMutation.mutate(data);
  };

  if (!contest) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Camera className="h-5 w-5 text-blue-600" />
            Submit to "{contest.title}"
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Contest Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
              <div className="text-xs text-gray-700 space-y-1">
                <p><span className="font-semibold">Prize:</span> ${Number(contest.prizeAmount || 0).toLocaleString()}</p>
                <p><span className="font-semibold">Ends:</span> {new Date(contest.endDate).toLocaleDateString()}</p>
                <p><span className="font-semibold text-green-600">✓ Free Entry</span></p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Upload Your Image</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {uploadedFile ? (
                  <div className="space-y-2">
                    <img
                      src={`${ASSETS_URL}${uploadedFile}`}
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
                          handleImageUpload(new File([], ""));
                          form.setValue("photoUrl", "");
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
                      Click to upload or drag and drop image
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                      className="hidden"
                      id="banner-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('banner-upload')?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? "Uploading..." : "Choose File"}
                    </Button>
                  </div>
                )}
              </div>
            </div>


            {/* Photo Details */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-900">Photo Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Give your photo a catchy title"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-9"
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
                    <FormLabel className="text-sm font-semibold text-gray-900">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your photo, the story behind it..."
                        rows={2}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-9 text-sm"
                disabled={submitPhotoMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitPhotoMutation.isPending || isUploading || !form.watch("photoUrl")}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm"
              >
                {submitPhotoMutation.isPending ? (
                  <>
                    <Clock className="h-3 w-3 mr-1 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-1" />
                    Submit Photo
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