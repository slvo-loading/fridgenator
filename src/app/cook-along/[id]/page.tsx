'use client'
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Recipe } from '@/app/lib/types'
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation'

import IntroSlide from '@/app/components/introSlide'
import OutroSlide from '@/app/components/outroSlide'
import StepSlide from '@/app/components/stepSlide'

export default function CookAlongPage() {
  const router = useRouter()

  const params = useParams();
  const recipeId = params?.id as string | undefined;

  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [recipe, setRecipe] = useState<null | Recipe>(null)
  const [totalSlides, setTotalSlides] = useState(0)


  // fetch the recipe
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`/api/recipes/${recipeId}`);
        const data = await response.json();
        
        if (response.ok) {
          console.log('response ok', data)
          setRecipe(data)
          setTotalSlides(1 + (data.instructions.length ?? 0) + 1)
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
        alert('Failed to load recipe');
        router.push('/recipe');
      }
    };

    fetchRecipe()
  }, [recipeId]);

  useEffect(() => {
    console.log('recipe loaded', recipe)
  }, [recipe])

  // if (!recipe) {
  //   return <div>Loading...</div>; // or some loading component
  // }
  
  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);
  
  const getCurrentSlideLabel = () => {
    if (currentSlide === 0) return 'Overview';
    if (currentSlide === totalSlides - 1) return 'Complete';
    return `Step ${currentSlide} of ${recipe?.instructions?.length}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      {!recipe ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-2xl">Loading...</div>
        </div>
      ) : (
        <>
          {/* Main slide content */}
          <div className="flex-1 flex items-center justify-center p-8 md:p-12">
            {currentSlide === 0 && <IntroSlide recipe={recipe} />}
            
            {currentSlide > 0 && currentSlide <= recipe.instructions.length && (
              <StepSlide 
                instruction={recipe.instructions[currentSlide - 1]} 
                stepNumber={currentSlide}
                totalSteps={recipe.instructions.length}
              />
            )}
            
            {currentSlide === totalSlides - 1 && <OutroSlide recipe={recipe} />}
          </div>
          
          {/* Navigation footer */}
          <div className="p-6 bg-black/30 backdrop-blur-md border-t border-white/10">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <button 
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="group flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/10"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Previous
              </button>
              
              <div className="text-center">
                <div className="text-gray-400 text-sm mb-1">
                  {getCurrentSlideLabel()}
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalSlides }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === currentSlide 
                          ? 'w-8 bg-orange-500' 
                          : 'w-2 bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              <button 
                onClick={nextSlide}
                disabled={currentSlide === totalSlides - 1}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10"
              >
                {currentSlide === totalSlides - 2 ? 'Finish' : 'Next'}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          
          <style jsx>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            .animate-fadeIn {
              animation: fadeIn 0.4s ease-out;
            }
            
            kbd {
              font-family: monospace;
            }
          `}</style>
        </>
      )}
    </div>
)
}