
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, User } from "lucide-react";

const ProfilePanel: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
  });

  // Additional fields for students
  const [studentData, setStudentData] = useState({
    rollNumber: user?.metadata?.rollNumber || "",
    className: user?.metadata?.className || "",
    section: user?.metadata?.section || "",
  });

  // Additional fields for teachers
  const [teacherData, setTeacherData] = useState({
    teacherId: user?.metadata?.teacherId || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeacherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTeacherData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      let metadata = {};
      
      if (user.role === "student") {
        metadata = { ...studentData };
      } else if (user.role === "teacher") {
        metadata = { ...teacherData };
      }
      
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          metadata
        })
        .eq("id", user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated.",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Your Profile</CardTitle>
          </div>
          <Button 
            variant={isEditing ? "outline" : "default"} 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>
        <CardDescription>
          View and manage your personal information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Your full name"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input
            value={user.email || ""}
            disabled
            placeholder="Your email address"
          />
          <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
        </div>
        
        <div className="space-y-2">
          <Label>Role</Label>
          <Input
            value={user.role === "teacher" ? "Teacher" : "Student"}
            disabled
            placeholder="Your role"
          />
        </div>
        
        {user.role === "student" && (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h3 className="text-sm font-medium">Student Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number</Label>
              <Input
                id="rollNumber"
                name="rollNumber"
                value={studentData.rollNumber}
                onChange={handleStudentInputChange}
                disabled={!isEditing}
                placeholder="Your roll number"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="className">Class</Label>
                <Input
                  id="className"
                  name="className"
                  value={studentData.className}
                  onChange={handleStudentInputChange}
                  disabled={!isEditing}
                  placeholder="Your class"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Input
                  id="section"
                  name="section"
                  value={studentData.section}
                  onChange={handleStudentInputChange}
                  disabled={!isEditing}
                  placeholder="Your section"
                />
              </div>
            </div>
          </div>
        )}
        
        {user.role === "teacher" && (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h3 className="text-sm font-medium">Teacher Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="teacherId">Teacher ID</Label>
              <Input
                id="teacherId"
                name="teacherId"
                value={teacherData.teacherId}
                onChange={handleTeacherInputChange}
                disabled={!isEditing}
                placeholder="Your teacher ID"
              />
            </div>
          </div>
        )}
      </CardContent>
      
      {isEditing && (
        <CardFooter>
          <Button 
            className="ml-auto" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProfilePanel;
