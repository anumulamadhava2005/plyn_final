
import React, { useState } from 'react';
import { PageTransition } from '@/components/transitions/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, Scissors, Image, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';

const HairRecommendation = () => {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [recommendedStyles, setRecommendedStyles] = useState<Array<{ name: string, description: string, imageUrl: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setPhoto(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setAnalysis(null);
      setRecommendedStyles([]);
      setError(null);
      setProgress(0);
    }
  };

  const handleRetry = () => {
    setError(null);
    setProgress(0);
    setIsLoading(false);
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
    setAnalysis(null);
    setRecommendedStyles([]);
    setError(null);
    setProgress(10);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(photo);
      
      reader.onload = async () => {
        try {
          setProgress(30);
          const base64String = (reader.result as string).split(',')[1];
          
          console.log("Sending photo for analysis...");
          setProgress(50);
          
          const { data, error } = await supabase.functions.invoke('analyze-face', {
            body: {
              imageBase64: base64String,
              gender: selectedGender
            }
          });
          
          setProgress(80);
          
          if (error) {
            console.error("Supabase function error:", error);
            throw new Error(error.message || "Failed to analyze photo");
          }
          
          if (data.error) {
            console.error("Analysis error:", data.error);
            throw new Error(data.error);
          }
          
          console.log("Analysis data received:", data);
          setProgress(90);
          
          setAnalysis(data.analysis);
          
          if (data.stylePrompts && data.stylePrompts.length > 0) {
            const stylesWithImages = data.stylePrompts.map((style: any, index: number) => {
              const baseUrl = "https://images.unsplash.com/photo-";
              let imageUrl = "";
              
              if (selectedGender === 'male') {
                const maleImages = [
                  "1583195764036-6dc248ac07d9?q=80&w=400",
                  "1587500154541-9cafd2393326?q=80&w=400",
                  "1519699047748-de8e457a634e?q=80&w=400"
                ];
                imageUrl = baseUrl + maleImages[index % maleImages.length];
              } else {
                const femaleImages = [
                  "1554519515-242393f652d4?q=80&w=400",
                  "1605980776566-0486c3ac7617?q=80&w=400",
                  "1595319100466-ec94616feba7?q=80&w=400"
                ];
                imageUrl = baseUrl + femaleImages[index % femaleImages.length];
              }
              
              return {
                ...style,
                imageUrl
              };
            });
            
            setRecommendedStyles(stylesWithImages);
          }
          
          setProgress(100);
          
          toast({
            title: "Analysis complete!",
            description: "We've analyzed your photo and found great hairstyle recommendations for you."
          });
        } catch (error: any) {
          console.error("Error in analysis process:", error);
          setError(error.message || "Failed to analyze the photo");
          toast({
            title: "Analysis failed",
            description: error.message || "We couldn't analyze your photo. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = (event) => {
        console.error("FileReader error:", event);
        setIsLoading(false);
        setError("Failed to read the image file");
        toast({
          title: "File error",
          description: "We couldn't read your photo. Please try another image.",
          variant: "destructive"
        });
      };
      
    } catch (error: any) {
      console.error("Error processing photo:", error);
      setIsLoading(false);
      setError(error.message || "An unknown error occurred");
      toast({
        title: "Something went wrong",
        description: error.message || "We couldn't process your photo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formattedAnalysis = analysis ? analysis.split('\n\n').map((paragraph, i) => (
    <p key={i} className="mb-3">{paragraph}</p>
  )) : null;

  return (
    <>
      <Navbar />
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
                
                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Analysis progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
          
          {error && (
            <Card className="mt-8 border-destructive">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-destructive">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Analysis Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{error}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please try again with a different photo, or ensure your face is clearly visible.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleRetry}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {analysis && (
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-bold">Your Hair Analysis</h2>
              <Card className="p-4">
                <div className="prose dark:prose-invert max-w-none">
                  {formattedAnalysis}
                </div>
              </Card>
              
              <h2 className="text-2xl font-bold mt-8">Recommended Styles</h2>
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
                      <p className="text-sm text-muted-foreground line-clamp-3">{style.description}</p>
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
    </>
  );
};

export default HairRecommendation;
