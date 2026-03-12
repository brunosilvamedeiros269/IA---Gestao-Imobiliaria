'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/utils/supabase/client'
import { ImagePlus, Loader2, Trash2, Star } from 'lucide-react'
import { toast } from 'sonner'

interface PropertyGalleryProps {
    value?: string[]
    onChange: (urls: string[]) => void
}

interface UploadingFile {
    id: string
    file: File
    preview: string
    progress: number
    status: 'compressing' | 'uploading' | 'done' | 'error'
}

export function PropertyGallery({ value = [], onChange }: PropertyGalleryProps) {
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
    const supabase = createClient()

    // Limpa previews da memória
    useEffect(() => {
        return () => uploadingFiles.forEach(f => URL.revokeObjectURL(f.preview))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: 'compressing' as const
        }))

        setUploadingFiles(prev => [...prev, ...newFiles])

        const newUrls: string[] = []

        for (const uf of newFiles) {
            try {
                // 1. Otimização Frontend (WebP / Responsive)
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                    fileType: 'image/webp'
                }
                const compressedFile = await imageCompression(uf.file, options)

                setUploadingFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'uploading', progress: 50 } : f))

                // 2. Autenticação e Path
                const { data: userData } = await supabase.auth.getUser()
                if (!userData.user) throw new Error("Usuário não autenticado")

                const filePath = `${userData.user.id}/${Date.now()}_${uf.id}.webp`

                // 3. Upload Direto
                const { error } = await supabase.storage
                    .from('property_images')
                    .upload(filePath, compressedFile, {
                        cacheControl: '3600',
                        upsert: false
                    })

                if (error) throw error

                // 4. Salvar URL Pública
                const { data: publicUrlData } = supabase.storage
                    .from('property_images')
                    .getPublicUrl(filePath)

                const url = publicUrlData.publicUrl
                newUrls.push(url)

                setUploadingFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'done', progress: 100 } : f))
            } catch (error) {
                console.error(error)
                toast.error(`Falha ao enviar e processar: ${uf.file.name}`)
                setUploadingFiles(prev => prev.filter(f => f.id !== uf.id))
            }
        }

        // Atualiza o estado pai em batch
        if (newUrls.length > 0) {
            onChange([...value, ...newUrls])
        }

    }, [value, onChange, supabase])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/webp': ['.webp']
        },
        maxSize: 10 * 1024 * 1024 // 10MB
    })

    const removeImage = (urlToRemove: string) => {
        onChange(value.filter(url => url !== urlToRemove))
    }

    const setAsCover = (urlToCover: string) => {
        const filtered = value.filter(url => url !== urlToCover)
        onChange([urlToCover, ...filtered])
    }

    // Mescla imagens prontas (URLs) com as que estão subindo
    const displayItems = [
        ...value.map(url => ({ type: 'url' as const, url })),
        ...uploadingFiles.filter(uf => uf.status !== 'done').map(uf => ({ type: 'upload' as const, ...uf }))
    ]

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'}
                `}
            >
                <input {...getInputProps()} />
                <ImagePlus className="mx-auto h-10 w-10 text-zinc-400 mb-4" />
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Arraste suas fotos aqui ou clique para selecionar
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                    Formatos JPG, PNG ou WebP. Máximo de 10MB por arquivo.<br />
                    Conversão inteligente para WebP de alta performance ativada.
                </p>
            </div>

            {displayItems.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                    {displayItems.map((item, index) => {
                        if (item.type === 'url') {
                            const isCover = index === 0
                            return (
                                <div key={item.url} className="group relative aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.url} alt="Galeria do Imóvel" className="object-cover w-full h-full" />

                                    {isCover && (
                                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" /> Capa
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                        {!isCover && (
                                            <button
                                                type="button"
                                                onClick={() => setAsCover(item.url)}
                                                className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                                                title="Definir como Foto Principal (Capa)"
                                            >
                                                <Star className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeImage(item.url)}
                                            className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )
                        } else {
                            // Uploading state
                            return (
                                <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex flex-col items-center justify-center">
                                    <div className="absolute inset-0 opacity-40">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.preview} alt="Preview" className="object-cover w-full h-full blur-sm" />
                                    </div>
                                    <div className="relative z-10 flex flex-col items-center p-2 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                                        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 bg-white/80 dark:bg-black/60 px-2 py-1 rounded shadow-sm backdrop-blur-sm">
                                            {item.status === 'compressing' ? 'Otimizando...' : `${item.progress}%`}
                                        </span>
                                    </div>
                                </div>
                            )
                        }
                    })}
                </div>
            )}
        </div>
    )
}
