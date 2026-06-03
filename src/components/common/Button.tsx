import { clsx } from 'clsx';
export function Button({children,className='',variant='primary',...props}:React.ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'soft'|'ghost'}){ return <button className={clsx('btn',`btn-${variant}`,className)} {...props}>{children}</button> }
