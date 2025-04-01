"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ImagePlus, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { VenueFormValues, VenueImage } from "@/app/dashboard/venues/create/types";

interface ImagesTabContentProps {
  form: UseFormReturn<VenueFormValues>;
  onBack: () => void;
  onNext: () => void; // This prop should be properly used
  venueId?: string; // Temporary ID for uploads before venue creation
}

export function ImagesTabContent({
  form,
  onBack,
  onNext,
  venueId,
}: ImagesTabContentProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Get current images from form
  const images = form.watch("images") || [];

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the 5 image limit
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images are allowed");
      return;
    }

    setIsUploading(true);

    try {
      // Upload each file
      const newImages: VenueImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Create form data
        const formData = new FormData();
        formData.append("file", file);
        if (venueId) formData.append("venueId", venueId);

        // Upload to Cloudinary via our API
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to upload image");
        }

        const result = await response.json();

        newImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }

      // Update the form
      form.setValue("images", [...images, ...newImages], { shouldValidate: true });

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success(`${newImages.length} image${newImages.length > 1 ? "s" : ""} uploaded successfully`);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    form.setValue("images", newImages, { shouldValidate: true });
  };

  return (
    <div className="space-y-4 mt-0">
      <FormField
        control={form.control}
        name="images"
        render={({ field }) => (
          <FormItem>
            <div className="mb-4">
              <FormLabel>Venue Images</FormLabel>
              <FormDescription>
                Upload up to 5 images of the venue. Recommended size: 1200x800 pixels.
              </FormDescription>
            </div>

            <FormControl>
              <div className="space-y-4">
                {/* Image upload button */}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isUploading || images.length >= 5}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || images.length >= 5}
                    className="w-full h-32 border-dashed flex flex-col gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <ImagePlus className="h-6 w-6" />
                    )}
                    <span>
                      {isUploading
                        ? "Uploading..."
                        : images.length >= 5
                        ? "Maximum 5 images reached"
                        : "Click to upload venue images"}
                    </span>
                  </Button>
                </div>

                {/* Image preview */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video relative rounded-md overflow-hidden border">
                          <Image
                            src={image.url}
                            alt={`Venue image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next: Review
        </Button>
      </div>
    </div>
  );
}