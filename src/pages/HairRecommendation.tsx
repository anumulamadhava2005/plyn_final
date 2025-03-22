
import React, { useState } from 'react';
import { PageTransition } from '@/components/transitions/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, Scissors, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const HairRecommendation = () => {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [recommendedStyles, setRecommendedStyles] = useState<Array<{ name: string, description: string, imageUrl: string }>>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!photo) {
      toast({
        title: "No photo selected",
        description: "Please upload your photo to get recommendations",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setRecommendation(null);
    
    try {
      // Simulate AI processing for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock recommendation response
      if (selectedGender === 'male') {
        setRecommendation("Based on your face shape and features, these hairstyles would suit you well:");
        setRecommendedStyles([
          {
            name: "Modern Pompadour",
            description: "A classic style with modern updates, providing volume on top and shorter sides.",
            imageUrl: "https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?q=80&w=400"
          },
          {
            name: "Textured Crop",
            description: "A low-maintenance style with textured top and faded sides, perfect for oval and square faces.",
            imageUrl: "https://images.unsplash.com/photo-1587500154541-9cafd2393326?q=80&w=400" 
          },
          {
            name: "Classic Side Part",
            description: "A timeless style that works well for professional settings and most face shapes.",
            imageUrl: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=400"
          }
        ]);
      } else {
        setRecommendation("Your face shape and features would look great with these hairstyles:");
        setRecommendedStyles([
          {
            name: "Layered Bob",
            description: "A versatile cut that adds volume and frames your face beautifully.",
            imageUrl: "https://images.unsplash.com/photo-1554519515-242393f652d4?q=80&w=400"
          },
          {
            name: "Long Layers",
            description: "Soft layers that enhance your natural texture and provide movement.",
            imageUrl: "https://images.unsplash.com/photo-1605980776566-0486c3ac7617?q=80&w=400"
          },
          {
            name: "Textured Lob",
            description: "A shoulder-length cut with texture that works well for various face shapes.",
            imageUrl: "https://images.unsplash.com/photo-1595319100466-ec94616feba7?q=80&w=400"
          }
        ]);
      }
      
      toast({
        title: "Analysis complete!",
        description: "We've found some great hairstyles for you."
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "We couldn't process your photo. Please try again.",
        variant: "destructive"
      });
      console.error("Error processing photo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition className="container mx-auto px-4 py-24 md:py-32">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">AI Hair Recommendations</h1>
        <p className="text-muted-foreground mb-8">Upload your photo to get personalized haircut suggestions</p>
        
        <Card>
          <CardHeader>
            <CardTitle>Get Your Personal Hair Recommendation</CardTitle>
            <CardDescription>
              Upload a clear photo of your face to see AI-suggested hairstyles that would suit you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender">Select your gender</Label>
                <RadioGroup 
                  value={selectedGender} 
                  onValueChange={(value) => setSelectedGender(value as 'male' | 'female')} 
                  className="flex flex-row space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="photo">Upload your photo</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-center border-2 border-dashed border-border rounded-lg p-4 h-40">
                      {photoPreview ? (
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          className="max-h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-muted-foreground">
                          <Image className="h-10 w-10 mb-2" />
                          <p className="text-sm">No photo selected</p>
                        </div>
                      )}
                    </div>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-4">
                    <h3 className="font-medium">Photo tips:</h3>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      <li>Use a recent, front-facing photo</li>
                      <li>Make sure your face is clearly visible</li>
                      <li>Good lighting will improve results</li>
                      <li>Remove glasses or accessories that cover your face</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading || !photo}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Scissors className="mr-2 h-4 w-4" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {recommendation && (
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold">Your Recommendations</h2>
            <p className="text-muted-foreground">{recommendation}</p>
            
            <div className="grid gap-4 md:grid-cols-3 mt-4">
              {recommendedStyles.map((style, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="h-48 w-full overflow-hidden">
                    <img 
                      src={style.imageUrl} 
                      alt={style.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">{style.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </CardContent>
                  <CardFooter className="pt-4 pb-4">
                    <Button variant="outline" className="w-full" onClick={() => navigate('/book-now')}>
                      Book This Style
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default HairRecommendation;
