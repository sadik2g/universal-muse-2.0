import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import DashboardNav from "@/components/layout/dashboard-nav";
import ProfileHeader from "@/components/dashboard/profile-header";
import { 
  User, 
  Mail, 
  MapPin, 
  Instagram, 
  Calendar, 
  Camera,
  Save,
  LogOut,
  Edit3,
  Upload,
  X,
  Check
} from "lucide-react";

export default function ProfileSettings() {
  const { model, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [formData, setFormData] = useState({
    name: model?.name || "",
    stageName: model?.stageName || "",
    bio: model?.bio || "",
    location: model?.location || "",
    instagramHandle: model?.instagramHandle || "",
    profileImage: model?.profileImage || "",
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("/api/profile/update", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Logout Failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // File upload handler
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadState('uploading');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/profile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, profileImage: data.url }));
      setUploadState('success');
      
      toast({
        title: "Upload Successful",
        description: "Profile picture uploaded successfully!",
      });

      // Reset success state after 2 seconds
      setTimeout(() => setUploadState('idle'), 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState('error');
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
      
      // Reset error state after 3 seconds
      setTimeout(() => setUploadState('idle'), 3000);
    }
  };

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: model?.name || "",
      stageName: model?.stageName || "",
      bio: model?.bio || "",
      location: model?.location || "",
      instagramHandle: model?.instagramHandle || "",
      profileImage: model?.profileImage || "",
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <DashboardNav />
      
      {/* Main Content */}
      <div className="flex-1 p-6">

        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
            <p className="text-gray-600">Manage your model profile and account settings</p>
          </div>
          {/* Page Title */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Profile Settings
            </h1>
            <p className="text-xl text-gray-600">
              Manage your profile information and account settings
            </p>
          </motion.div>

          {/* Profile Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
                    <User className="h-6 w-6 text-purple-600" />
                    <span>Profile Information</span>
                  </CardTitle>
                  {!isEditing ? (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave}
                        disabled={updateProfileMutation.isPending}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-shrink-0">
                    <Avatar className="w-24 h-24 border-4 border-purple-200">
                      <AvatarImage src={formData.profileImage}  alt={formData.name} />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {getInitials(formData.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {isEditing && (
                    <div className="flex-1 space-y-4">
                      <Label>Profile Picture</Label>
                      
                      {/* File Upload Area */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          isDragOver
                            ? 'border-purple-500 bg-purple-50'
                            : uploadState === 'success'
                            ? 'border-green-500 bg-green-50'
                            : uploadState === 'error'
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 hover:border-purple-400 bg-gray-50 hover:bg-purple-50'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                        
                        {uploadState === 'uploading' ? (
                          <div className="space-y-2">
                            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-purple-600 font-medium">Uploading...</p>
                          </div>
                        ) : uploadState === 'success' ? (
                          <div className="space-y-2">
                            <Check className="w-8 h-8 text-green-500 mx-auto" />
                            <p className="text-green-600 font-medium">Upload successful!</p>
                          </div>
                        ) : uploadState === 'error' ? (
                          <div className="space-y-2">
                            <X className="w-8 h-8 text-red-500 mx-auto" />
                            <p className="text-red-600 font-medium">Upload failed</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                            <p className="text-gray-600 font-medium">
                              Drop your profile picture here, or{' '}
                              <button
                                type="button"
                                onClick={triggerFileInput}
                                className="text-purple-600 hover:text-purple-700 underline"
                              >
                                browse files
                              </button>
                            </p>
                            <p className="text-sm text-gray-500">
                              Supports JPG, PNG, GIF up to 5MB
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Current Image Preview */}
                      {formData.profileImage && (
                        <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                          <img
                            src={formData.profileImage}
                            alt="Profile preview"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Current profile picture</p>
                            <p className="text-xs text-gray-500">Click upload area to change</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleInputChange("profileImage", "")}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-md">{formData.name}</p>
                    )}
                  </div>

                  {/* Stage Name */}
                  <div className="space-y-2">
                    <Label htmlFor="stageName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Stage Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="stageName"
                        value={formData.stageName}
                        onChange={(e) => handleInputChange("stageName", e.target.value)}
                        placeholder="Enter your stage/professional name"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-md">{formData.stageName || "Not set"}</p>
                    )}
                  </div>

                  {/* Email (read-only) */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <p className="px-3 py-2 bg-gray-100 rounded-md text-gray-600">{user?.email}</p>
                    <p className="text-sm text-gray-500">Email cannot be changed</p>
                  </div>

                  {/* Member Since */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </Label>
                    <p className="px-3 py-2 bg-gray-100 rounded-md text-gray-600">
                      {model?.createdAt ? new Date(model.createdAt).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-md min-h-[100px]">
                      {formData.bio || "No bio provided"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Actions */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Account Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    {logoutMutation.isPending ? "Logging out..." : "Sign Out"}
                  </Button>
                  <p className="text-sm text-gray-500 self-center">
                    You will be redirected to the home page after signing out
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}