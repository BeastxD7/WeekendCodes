"use client";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import axios from "axios";

interface NoteData {
  title: string;
  description: string;
  status: string;
  dueDate: string;
}

export function DialogDemo() {
  const [noteData, setNoteData] = useState<NoteData>({
    title: "",
    description: "",
    status: "ACTIVE",
    dueDate: new Date().toISOString().split('T')[0] // Default to today's date
  });
  const [open, setOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNoteData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      
      const response = await axios.post(' http://localhost:8000/api/notes', noteData, {
        withCredentials: true // Ensure cookies are sent with the request
      });

          // Reset form
    setNoteData({
      title: "",
      description: "",
      status: "ACTIVE",
      dueDate: ""
    });
    
    // Close dialog
    setOpen(false);
    console.log("Note created successfully:", response.data);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Notes</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a new note</DialogTitle>
            <DialogDescription className="text-wrap">
              Fill in the details for your new note below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Title</Label>
              <Input 
                id="name-1" 
                placeholder="Enter title" 
                name="title"
                value={noteData.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description-1">Description</Label>
              <textarea 
                id="description-1" 
                placeholder="Enter description" 
                name="description"
                value={noteData.description}
                onChange={handleInputChange}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              />
            </div>
            <div className="grid gap-3">
                <Label htmlFor="status-1">Status</Label>
                <select 
                    id="status-1" 
                    name="status"
                    value={noteData.status}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                </select>
            </div>
            </div>
            <div className="grid gap-3">
                <Label htmlFor="dueDate-1">Due Date</Label>
                <Input 
                  id="dueDate-1" 
                  name="dueDate" 
                  type="date"
                  value={noteData.dueDate}
                  onChange={handleInputChange}
                />
            </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
