'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { NewTransactionModal } from './new-transaction-modal'

export function FinanceHeaderActions() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 rounded-xl"
            >
                <Plus className="h-4 w-4" />
                Novo Lançamento
            </Button>

            <NewTransactionModal 
                open={isModalOpen} 
                onOpenChange={setIsModalOpen} 
            />
        </>
    )
}
