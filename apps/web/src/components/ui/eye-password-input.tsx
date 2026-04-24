'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from './input'

type EyePasswordInputProps = React.ComponentProps<typeof Input>;

export function EyePasswordInput({ className, ...props }: EyePasswordInputProps) {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <div className={`relative ${className ?? ''}`}>
            <Input
                {...props}
                type={showPassword ? 'text' : 'password'}
                className="pr-10"
                
        />
        <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
    </div>
    );
}