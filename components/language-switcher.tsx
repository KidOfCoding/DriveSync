'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Change Language">
                    <Languages className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Change Language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-accent' : ''}>
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('hi')} className={language === 'hi' ? 'bg-accent' : ''}>
                    हिंदी (Hindi)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('or')} className={language === 'or' ? 'bg-accent' : ''}>
                    ଓଡ଼ିଆ (Odia)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
