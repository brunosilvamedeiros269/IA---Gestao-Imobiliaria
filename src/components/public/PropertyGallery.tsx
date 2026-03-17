'use client'

import React, { useState, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    ChevronLeft, 
    ChevronRight, 
    Maximize2, 
    X, 
    Building,
    Camera
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
    Dialog, 
    DialogContent, 
    DialogTrigger,
    DialogTitle
} from '@/components/ui/dialog'
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface PropertyGalleryProps {
    photos: string[]
    theme?: 'modern' | 'minimalist'
}

export function PropertyGallery({ photos, theme = 'modern' }: PropertyGalleryProps) {
    const [mainViewportRef, emblaMainApi] = useEmblaCarousel({ loop: true, dragFree: false })
    const [thumbViewportRef, emblaThumbsApi] = useEmblaCarousel({
        containScroll: 'keepSnaps',
        dragFree: true,
    })
    
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isCinemaMode, setIsCinemaMode] = useState(false)

    const onThumbClick = useCallback(
        (index: number) => {
            if (!emblaMainApi || !emblaThumbsApi) return
            emblaMainApi.scrollTo(index)
        },
        [emblaMainApi, emblaThumbsApi]
    )

    const onSelect = useCallback(() => {
        if (!emblaMainApi || !emblaThumbsApi) return
        setSelectedIndex(emblaMainApi.selectedScrollSnap())
        emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap())
    }, [emblaMainApi, emblaThumbsApi, setSelectedIndex])

    useEffect(() => {
        if (!emblaMainApi) return
        onSelect()
        emblaMainApi.on('select', onSelect)
        emblaMainApi.on('reInit', onSelect)
    }, [emblaMainApi, onSelect])

    if (!photos || photos.length === 0) {
        return (
            <div className="w-full aspect-[16/8] bg-zinc-100 rounded-[3rem] flex items-center justify-center border-2 border-dashed border-zinc-200">
                <div className="text-center space-y-2">
                    <Building className="h-10 w-10 text-zinc-300 mx-auto" />
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Sem fotos disponíveis</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Desktop Mosaic / Mobile Hero Image with "View More" */}
            <div className="relative group">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-[400px] md:h-[500px] overflow-hidden rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-zinc-200/50">
                    {/* Hero Image */}
                    <div 
                        className="md:col-span-8 h-full relative group/hero overflow-hidden bg-zinc-100 cursor-pointer"
                        onClick={() => setIsCinemaMode(true)}
                    >
                        <img 
                            src={photos[0]} 
                            className={cn(
                                "w-full h-full object-cover transition-transform duration-1000 group-hover/hero:scale-105",
                                theme === 'minimalist' && "grayscale group-hover/hero:grayscale-0"
                            )} 
                            alt="Main View" 
                        />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/hero:opacity-100 transition-opacity" />
                    </div>

                    {/* Sub-grid of 2 images (Hidden on mobile if only 1 photo) */}
                    <div className="md:col-span-4 grid grid-rows-2 gap-3 h-full hidden md:grid">
                        {[1, 2].map((idx) => {
                            const photo = photos[idx];
                            const isLast = idx === 2 && photos.length > 3;

                            if (!photo) return <div key={idx} className="bg-zinc-50 border border-zinc-100 border-dashed rounded-3xl" />;

                            return (
                                <div 
                                    key={idx} 
                                    className="relative group/thumb overflow-hidden bg-zinc-100 rounded-3xl h-full cursor-pointer"
                                    onClick={() => {
                                        setSelectedIndex(idx)
                                        setIsCinemaMode(true)
                                    }}
                                >
                                    <img 
                                        src={photo} 
                                        className={cn(
                                            "w-full h-full object-cover transition-transform duration-1000 group-hover/thumb:scale-110",
                                            theme === 'minimalist' && "grayscale group-hover/thumb:grayscale-0"
                                        )} 
                                        alt={`Detail ${idx}`} 
                                    />
                                    {isLast && (
                                        <div className="absolute inset-0 bg-black/60 group-hover/thumb:bg-black/40 flex flex-col items-center justify-center backdrop-blur-md transition-all border border-white/10 m-2 rounded-2xl">
                                            <span className="text-white font-black text-2xl tracking-tighter">+{ photos.length - 3 }</span>
                                            <span className="text-white/80 font-black text-[8px] uppercase tracking-[0.2em] mt-0.5">Ver Todas</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Floating "Ver Todas" Gallery Trigger for Mobile */}
                <Button 
                    variant="secondary" 
                    size="sm"
                    className="absolute bottom-6 right-6 md:hidden rounded-full bg-white/90 backdrop-blur-md border-none shadow-xl font-black uppercase text-[10px] tracking-widest gap-2"
                    onClick={() => setIsCinemaMode(true)}
                >
                    <Camera className="h-3 w-3" /> Ver {photos.length} Fotos
                </Button>
            </div>

            {/* Cinema Mode Dialog */}
            <Dialog open={isCinemaMode} onOpenChange={setIsCinemaMode}>
                <DialogContent className="max-w-[100vw] h-[100vh] p-0 border-none bg-black/95 backdrop-blur-2xl">
                    <VisuallyHidden.Root>
                        <DialogTitle>Galeria de Imagens</DialogTitle>
                    </VisuallyHidden.Root>
                    
                    <div className="relative w-full h-full flex flex-col">
                        {/* Header Controls */}
                        <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
                            <div className="flex flex-col">
                                <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] opacity-80">Galeria Imersiva</p>
                                <p className="text-white/50 font-bold text-[8px] uppercase tracking-widest">{selectedIndex + 1} de {photos.length}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-full text-white hover:bg-white/10"
                                onClick={() => setIsCinemaMode(false)}
                            >
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        {/* Main Carousel Area */}
                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="w-full max-w-6xl aspect-[16/10] relative overflow-hidden rounded-[2rem] shadow-2xl shadow-black/50" ref={mainViewportRef}>
                                <div className="flex h-full">
                                    {photos.map((src, index) => (
                                        <div key={index} className="flex-[0_0_100%] min-w-0 h-full relative">
                                            <img 
                                                src={src} 
                                                alt={`Property view ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Navigation Buttons */}
                                <button 
                                    onClick={() => emblaMainApi?.scrollPrev()}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-md transition-all z-10 border border-white/10"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button 
                                    onClick={() => emblaMainApi?.scrollNext()}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-md transition-all z-10 border border-white/10"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Thumbnails Strip */}
                        <div className="p-6 pb-12 overflow-hidden" ref={thumbViewportRef}>
                            <div className="flex gap-4">
                                {photos.map((src, index) => (
                                    <button
                                        key={index}
                                        onClick={() => onThumbClick(index)}
                                        className={cn(
                                            "relative flex-[0_0_100px] min-w-0 aspect-[4/3] rounded-xl overflow-hidden transition-all border-2",
                                            selectedIndex === index ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                                        )}
                                    >
                                        <img src={src} className="w-full h-full object-cover" alt={`Thumb ${index}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
