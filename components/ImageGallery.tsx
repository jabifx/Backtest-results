"use client"

import { useState } from "react"
import Image from "next/image"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react"
import type { TradeImage } from "@/lib/types"

interface ImageGalleryProps {
    images: TradeImage[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    if (!images || images.length === 0) return null

    const currentImage = images[currentImageIndex]

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const goToImage = (index: number) => {
        setCurrentImageIndex(index)
    }

    return (
        <div className="space-y-4">
            <div className="relative w-full bg-muted rounded-lg overflow-hidden cursor-pointer group aspect-[16/9]">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-gradient-to-r from-black/70 to-black/50 text-white px-5 py-2 rounded-full shadow-md transition-all duration-300 group-hover:shadow-lg">
          <span className="text-sm font-bold tracking-tight">
            {currentImage.titulo}
          </span>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <div className="relative w-full h-full">
                            <Image
                                src={`data:image/png;base64,${currentImage.imagen}`}
                                alt={currentImage.titulo}
                                fill
                                className="object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                                <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-transparent border-none shadow-none">
                        <div className="relative w-full h-[90vh] aspect-[16/9]">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-black/70 to-black/50 text-white px-5 py-2 rounded-full shadow-md">
                <span className="text-sm font-bold tracking-tight">
                  {currentImage.titulo}
                </span>
                            </div>

                            <DialogClose className="absolute top-2 right-2 z-20 bg-transparent backdrop-blur-sm text-white p-3 rounded-md shadow-md hover:bg-white/10 transition-all duration-200">
                                <X className="h-7 w-7" />
                            </DialogClose>

                            {images.length > 1 && (
                                <>
                                    <button
                                        className="absolute top-1/2 left-3 z-20 -translate-y-1/2 bg-transparent backdrop-blur-sm text-white p-2 rounded-full shadow-md hover:bg-white/10 hover:scale-110 transition-all duration-200"
                                        onClick={prevImage}
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        className="absolute top-1/2 right-3 z-20 -translate-y-1/2 bg-transparent backdrop-blur-sm text-white p-2 rounded-full shadow-md hover:bg-white/10 hover:scale-110 transition-all duration-200"
                                        onClick={nextImage}
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            )}

                            <Image
                                src={`data:image/png;base64,${currentImage.imagen}`}
                                alt={currentImage.titulo}
                                fill
                                className="object-contain z-10"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
                {images.length > 1 && (
                    <>
                        <button
                            className="absolute top-1/2 left-3 z-10 -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white p-2 rounded-full shadow-md hover:bg-black/60 hover:scale-110 transition-all duration-200"
                            onClick={prevImage}
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            className="absolute top-1/2 right-3 z-10 -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white p-2 rounded-full shadow-md hover:bg-black/60 hover:scale-110 transition-all duration-200"
                            onClick={nextImage}
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className="flex justify-center gap-2 overflow-x-auto py-2">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            className={`relative w-16 h-10 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                                index === currentImageIndex
                                    ? "border-primary opacity-100"
                                    : "border-transparent opacity-70 hover:opacity-100 hover:border-muted-foreground/50"
                            }`}
                            onClick={() => goToImage(index)}
                            aria-label={`Select image ${index + 1}`}
                        >
                            <Image
                                src={`data:image/png;base64,${image.imagen}`}
                                alt={image.titulo}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
